import axios from "axios";

const API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const BASE_URL = "https://www.alphavantage.co/query";

export async function fetchDailyStockPrice(symbol) {
	const response = await axios.get(BASE_URL, {
		params: {
			function: "TIME_SERIES_DAILY",
			symbol,
			apikey: API_KEY,
		},
	});
	return response.data;
}

export async function fetchQuote(symbol) {
	const response = await axios.get(BASE_URL, {
		params: {
			function: "GLOBAL_QUOTE",
			symbol,
			apikey: API_KEY,
		},
	});
	return response.data["Global Quote"];
}

// 과거 주가 데이터 가져오기 (매입 시기 기준)
export async function fetchHistoricalPrice(symbol, date) {
	try {
		const response = await axios.get(BASE_URL, {
			params: {
				function: "TIME_SERIES_DAILY",
				symbol,
				apikey: API_KEY,
			},
		});

		const timeSeriesData = response.data["Time Series (Daily)"];
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

		if (closestDate && timeSeriesData[closestDate]) {
			const historicalData = timeSeriesData[closestDate];
			return {
				date: closestDate,
				open: parseFloat(historicalData["1. open"]),
				high: parseFloat(historicalData["2. high"]),
				low: parseFloat(historicalData["3. low"]),
				close: parseFloat(historicalData["4. close"]),
				volume: parseInt(historicalData["5. volume"]),
			};
		}

		return null;
	} catch (error) {
		console.error("Error fetching historical price:", error);
		return null;
	}
}

// 무료 버전 API 사용시 한계가 있음 ㅠㅠ
export async function searchSymbol(keyword) {
	const response = await axios.get(BASE_URL, {
		params: {
			function: "SYMBOL_SEARCH",
			keywords: keyword,
			apikey: API_KEY,
		},
	});

	const matches = response.data.bestMatches;

	if (!matches || matches.length === 0) {
		return [];
	}

	return matches;
}
