import axios from "axios";
import { BASE_URL } from "../const";

export const fetchDailyBriefing = async () => {
	const token = localStorage.getItem("authToken");

	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.get(`${BASE_URL}/insight/daily-briefing`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	return res.data;
};
export const runTimeMachine = async ({
	base_ticker,
	comparison_ticker,
	investment_amount,
	investment_date,
}) => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const payload = {
		base_ticker,
		comparison_ticker,
		investment_amount,
		investment_date,
	};

	const res = await axios.post(`${BASE_URL}/insight/time-machine`, payload, {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
	});

	return res.data; // { graph_data, final_metrics, ai_analysis }
};

export const fetchInsightHistory = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.get(`${BASE_URL}/insight/history/insights`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data; // Array<Insight>
};
