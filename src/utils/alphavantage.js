import axios from "axios";

const API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

// API 호출 제한 관리 - 분당 2회
let lastCallTime = 0;
const MIN_CALL_INTERVAL = 30 * 1000; // 30초 (분당 2회 = 30초 간격)

// 캐시 시스템 - 30초간 유효
const CACHE_DURATION = 30 * 1000; // 30초
const cache = new Map();

// 캐시 유틸리티 함수들
function getCacheKey(functionName, symbol, date = null) {
	return `${functionName}_${symbol}_${date || 'current'}`;
}

function getCachedData(key) {
	const cached = cache.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}
	return null;
}

function setCachedData(key, data) {
	cache.set(key, {
		data,
		timestamp: Date.now()
	});
}

async function makeApiCall(params) {
	const now = Date.now();
	const timeSinceLastCall = now - lastCallTime;
	
	if (timeSinceLastCall < MIN_CALL_INTERVAL) {
		const waitTime = MIN_CALL_INTERVAL - timeSinceLastCall;
		console.log(`API 호출 대기 중: ${Math.round(waitTime / 1000)}초 남음`);
		await new Promise(resolve => setTimeout(resolve, waitTime));
	}
	
	lastCallTime = Date.now();
	console.log(`API 호출 시작: ${params.function} - ${params.symbol || params.keywords}`);
	
	try {
		const response = await axios.get(BASE_URL, { params });
		
		// API 제한 확인
		if (response.data.Note) {
			console.error("API 제한 도달:", response.data.Note);
			throw new Error("API 호출 제한에 도달했습니다. 30초 후 다시 시도해주세요.");
		}
		
		console.log(`API 호출 성공: ${params.function} - ${params.symbol || params.keywords}`);
		return response.data;
	} catch (error) {
		console.error(`API 호출 실패: ${params.function} - ${params.symbol || params.keywords}`, error.message);
		if (error.response?.status === 429) {
			throw new Error("API 호출 제한에 도달했습니다. 30초 후 다시 시도해주세요.");
		}
		throw error;
	}
}

export async function fetchDailyStockPrice(symbol) {
	const cacheKey = getCacheKey('daily', symbol);
	const cached = getCachedData(cacheKey);
	
	if (cached) {
		console.log(`캐시된 데이터 사용: ${symbol} (30초 내 재사용)`);
		return cached;
	}
	
	console.log(`새로운 API 호출: ${symbol}`);
	const data = await makeApiCall({
		function: "TIME_SERIES_DAILY",
		symbol,
		apikey: API_KEY,
	});
	
	setCachedData(cacheKey, data);
	return data;
}

export async function fetchQuote(symbol) {
	const cacheKey = getCacheKey('quote', symbol);
	const cached = getCachedData(cacheKey);
	
	if (cached) {
		console.log(`캐시된 데이터 사용: ${symbol} (30초 내 재사용)`);
		return cached;
	}
	
	console.log(`새로운 API 호출: ${symbol}`);
	const data = await makeApiCall({
		function: "GLOBAL_QUOTE",
		symbol,
		apikey: API_KEY,
	});
	
	const quote = data["Global Quote"];
	setCachedData(cacheKey, quote);
	return quote;
}

// 과거 주가 데이터 가져오기 (매입 시기 기준)
export async function fetchHistoricalPrice(symbol, date) {
	try {
		const cacheKey = getCacheKey('historical', symbol, date);
		const cached = getCachedData(cacheKey);
		
		if (cached) {
			console.log(`캐시된 과거 데이터 사용: ${symbol} (${date}) (30초 내 재사용)`);
			return cached;
		}
		
		console.log(`새로운 과거 데이터 API 호출: ${symbol} (${date})`);
		const data = await makeApiCall({
			function: "TIME_SERIES_DAILY",
			symbol,
			apikey: API_KEY,
		});

		const timeSeriesData = data["Time Series (Daily)"];
		if (!timeSeriesData) {
			console.error("No time series data available");
			return null;
		}

		// 매입일과 가장 가까운 거래일 찾기
		const purchaseDate = new Date(date);
		const availableDates = Object.keys(timeSeriesData).sort();
		
		// 매입일 이후의 가장 가까운 거래일 찾기
		let closestDate = null;
		for (const availableDate of availableDates) {
			const availableDateObj = new Date(availableDate);
			if (availableDateObj >= purchaseDate) {
				closestDate = availableDate;
				break;
			}
		}

		// 매입일 이후 거래일이 없으면 가장 최근 거래일 사용
		if (!closestDate && availableDates.length > 0) {
			closestDate = availableDates[availableDates.length - 1];
		}

		let result = null;
		if (closestDate && timeSeriesData[closestDate]) {
			const historicalData = timeSeriesData[closestDate];
			result = {
				date: closestDate,
				open: parseFloat(historicalData["1. open"]),
				high: parseFloat(historicalData["2. high"]),
				low: parseFloat(historicalData["3. low"]),
				close: parseFloat(historicalData["4. close"]),
				volume: parseInt(historicalData["5. volume"]),
			};
		}

		setCachedData(cacheKey, result);
		return result;
	} catch (error) {
		console.error("Error fetching historical price:", error);
		return null;
	}
}

// 무료 버전 API 사용시 한계가 있음 ㅠㅠ
export async function searchSymbol(keyword) {
	const cacheKey = getCacheKey('search', keyword);
	const cached = getCachedData(cacheKey);
	
	if (cached) {
		console.log(`캐시된 검색 결과 사용: ${keyword} (30초 내 재사용)`);
		return cached;
	}
	
	console.log(`새로운 검색 API 호출: ${keyword}`);
	const data = await makeApiCall({
		function: "SYMBOL_SEARCH",
		keywords: keyword,
		apikey: API_KEY,
	});

	const matches = data.bestMatches || [];
	setCachedData(cacheKey, matches);
	return matches;
}

// 캐시 초기화 함수 (필요시 사용)
export function clearCache() {
	cache.clear();
	console.log("API 캐시가 초기화되었습니다.");
}

// 캐시 상태 확인 함수
export function getCacheStatus() {
	const now = Date.now();
	const validEntries = Array.from(cache.entries()).filter(([key, value]) => {
		return now - value.timestamp < CACHE_DURATION;
	});
	
	return {
		totalEntries: cache.size,
		validEntries: validEntries.length,
		expiredEntries: cache.size - validEntries.length,
		nextUpdateIn: Math.max(0, MIN_CALL_INTERVAL - (now - lastCallTime))
	};
}
