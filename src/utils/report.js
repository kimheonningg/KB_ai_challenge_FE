import axios from "axios";
import { BASE_URL } from "../const";

export const fetchCreateReport = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.post(`${BASE_URL}/report/create`, null, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};

export const fetchReportsList = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.get(`${BASE_URL}/report/all`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};

export const deleteReport = async (reportId) => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.delete(`${BASE_URL}/report/${reportId}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};
