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
