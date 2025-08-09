import axios from "axios";
import { BASE_URL } from "../const";

export async function addFavStock(ticker) {
	const token = localStorage.getItem("authToken");
	const res = await axios.post(`${BASE_URL}/fav_stocks/add/${ticker}`, null, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
}

export async function deleteFavStock(ticker) {
	const token = localStorage.getItem("authToken");
	const res = await axios.delete(`${BASE_URL}/fav_stocks/${ticker}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
}

export async function isFavStock(ticker) {
	const token = localStorage.getItem("authToken");
	const res = await axios.get(`${BASE_URL}/fav_stocks/all`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const data = res.data;
	const list = Array.isArray(data?.list) ? data.list : [];
	return (
		list.includes(ticker) ||
		list.some(
			(x) =>
				(typeof x === "string" && x === ticker) ||
				x?.ticker === ticker ||
				x?.symbol === ticker
		)
	);
}

export async function getFavStocks() {
	const token = localStorage.getItem("authToken");
	const res = await axios.get(`${BASE_URL}/fav_stocks/all`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const list = Array.isArray(res.data?.list) ? res.data.list : [];
	return list
		.map((x) => (typeof x === "string" ? x : x?.ticker || x?.symbol))
		.filter(Boolean);
}
