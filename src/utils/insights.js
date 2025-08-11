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
