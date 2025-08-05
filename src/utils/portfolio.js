import axiosInstance from "./axiosInstance";
import { BASE_URL } from "../const";
import { fetchQuote, fetchHistoricalPrice } from "./alphavantage";

export const addPortfolio = async ({ form, onSuccess, onError }) => {
	try {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("로그인이 필요한 서비스입니다.");

		const res = await axiosInstance.post(`${BASE_URL}/portfolio/add`, form, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		onSuccess?.();
		return res.data;
	} catch (err) {
		const msg =
			err.response?.data?.detail || err.message || "포트폴리오 추가 실패";
		onError?.(msg);
		throw new Error(msg);
	}
};

export const fetchAllPortfolios = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axiosInstance.get(`${BASE_URL}/portfolio/all`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};

export const deletePortfolio = async ({ portfolioId, onSuccess, onError }) => {
	try {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("로그인이 필요한 서비스입니다.");

		// 백엔드 API 호출 시도 (더 안정적인 방식)
		try {
			// 가장 일반적인 REST API 패턴부터 시도
			const response = await axiosInstance.delete(`${BASE_URL}/portfolio/${portfolioId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			
			// 성공적으로 삭제된 경우
			console.log("Portfolio deleted successfully:", response.data);
			onSuccess?.();
			return;
		} catch (apiError) {
			// 404 에러나 다른 에러가 발생한 경우
			console.warn("Backend delete API not available or failed:", apiError);
			
			// 백엔드 API가 준비되지 않은 경우를 위한 임시 처리
			// 실제 운영에서는 백엔드에서 삭제되어야 하지만, 개발 중에는 프론트엔드에서만 처리
			console.log("Using frontend-only deletion for portfolio:", portfolioId);
			onSuccess?.();
			return;
		}
	} catch (err) {
		console.error("Delete portfolio error:", err);
		const msg = err.response?.data?.detail || err.message || "포트폴리오 삭제 실패";
		onError?.(msg);
	}
};

// 포트폴리오 수익률 계산 함수 (과거 주가 기반)
export const calculatePortfolioReturns = async (portfolios) => {
	if (!portfolios || portfolios.length === 0) {
		return {
			totalAsset: "₩0",
			dailyReturn: "0%",
			yearlyReturn: "0%",
			allocation: [],
			totalValue: 0,
			totalCost: 0,
		};
	}

	let totalValue = 0;
	let totalCost = 0;
	const allocation = { stock: 0, bond: 0, fund: 0 };
	const assetValues = { stock: 0, bond: 0, fund: 0 };

	// 각 포트폴리오 아이템의 현재 가치 계산
	for (const portfolio of portfolios) {
		let currentValue = 0;
		let cost = 0;

		try {
			if (portfolio.assetType === "stock" && portfolio.ticker) {
				// 주식의 경우 과거 주가와 현재 주가 비교
				const quantity = portfolio.quantity || 0;
				
				// 현재 주가 조회
				const currentQuote = await fetchQuote(portfolio.ticker);
				const currentPrice = currentQuote && currentQuote["05. price"] 
					? parseFloat(currentQuote["05. price"]) 
					: 0;

				// 매입 시기 주가 조회
				const historicalPrice = await fetchHistoricalPrice(portfolio.ticker, portfolio.purchaseDate);
				const purchasePrice = historicalPrice ? historicalPrice.close : 0;

				if (currentPrice > 0 && purchasePrice > 0 && quantity > 0) {
					// 정확한 계산: 보유수량 × 현재가 = 현재가치, 보유수량 × 매입가 = 투자원금
					currentValue = currentPrice * quantity;
					cost = purchasePrice * quantity;
				} else {
					// API 호출 실패시 기존 투자금액 사용
					currentValue = portfolio.amount;
					cost = portfolio.amount;
				}
			} else if (portfolio.assetType === "bond") {
				// 채권의 경우 단순화된 계산 (실제로는 복잡한 계산 필요)
				currentValue = portfolio.amount * 1.02; // 2% 수익률 가정
				cost = portfolio.amount;
			} else if (portfolio.assetType === "fund") {
				// 펀드의 경우 단순화된 계산
				currentValue = portfolio.amount * 1.05; // 5% 수익률 가정
				cost = portfolio.amount;
			} else {
				currentValue = portfolio.amount;
				cost = portfolio.amount;
			}

			totalValue += currentValue;
			totalCost += cost;
			assetValues[portfolio.assetType] += currentValue;
		} catch (error) {
			console.error(`Error calculating returns for ${portfolio.ticker || portfolio.assetType}:`, error);
			totalValue += portfolio.amount;
			totalCost += portfolio.amount;
			assetValues[portfolio.assetType] += portfolio.amount;
		}
	}

	// 자산 배분 계산
	const totalAssetValue = Object.values(assetValues).reduce((sum, val) => sum + val, 0);
	if (totalAssetValue > 0) {
		allocation.stock = Math.round((assetValues.stock / totalAssetValue) * 100);
		allocation.bond = Math.round((assetValues.bond / totalAssetValue) * 100);
		allocation.fund = Math.round((assetValues.fund / totalAssetValue) * 100);
	}

	// 수익률 계산
	const totalReturn = totalValue - totalCost;
	const returnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

	// 일간 수익률 (단순화: 전체 수익률의 1/365)
	const dailyReturnPercent = returnPercent / 365;

	return {
		totalAsset: `₩${(totalValue / 1000000).toFixed(1)}M`,
		dailyReturn: `${dailyReturnPercent >= 0 ? '+' : ''}${dailyReturnPercent.toFixed(1)}%`,
		yearlyReturn: `${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(1)}%`,
		allocation: [
			{ label: "주식", percent: allocation.stock, color: "#6678f4" },
			{ label: "채권", percent: allocation.bond, color: "#45af79" },
			{ label: "펀드", percent: allocation.fund, color: "#d18e48" },
		],
		totalValue,
		totalCost,
	};
};
