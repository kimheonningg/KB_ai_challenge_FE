import axios from "axios";
import { BASE_URL } from "../const";

export const normalizeRiskReports = (raw) => {
	const arr = Array.isArray(raw?.risk_reports) ? raw.risk_reports : [];
	return arr.map((r) => ({
		stock: r?.stock ?? null,
		ticker: r?.ticker ?? null,
		risk_score:
			typeof r?.risk_score === "number"
				? r.risk_score
				: Number(r?.risk_score ?? 0),
		risk_level: r?.risk_level ?? null,
		report: r?.report ?? "",
		top_news_links: Array.isArray(r?.top_news_links) ? r.top_news_links : [],
	}));
};

export const fetchRiskAnalysis = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.get(`${BASE_URL}/report/risk_analysis`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return normalizeRiskReports(res.data);
};

export const fetchRiskStatus = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.get(`${BASE_URL}/report/risk-status`, {
		headers: { Authorization: `Bearer ${token}` },
	});

	return res.data;
};
