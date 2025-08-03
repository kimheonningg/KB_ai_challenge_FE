import axiosInstance from "./axiosInstance";
import { BASE_URL } from "../const";

export const addPortfolio = async ({ form, onSuccess, onError }) => {
	try {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("로그인이 필요한 서비스입니다.");

		await axiosInstance.post(`${BASE_URL}/portfolio/add`, form, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		onSuccess?.();
	} catch (err) {
		const msg =
			err.response?.data?.detail || err.message || "포트폴리오 추가 실패";
		onError?.(msg);
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
