import axios from "axios";
import { BASE_URL } from "../const";

export const handleLogin = async ({ userId, password, onSuccess, onError }) => {
	try {
		const res = await axios.post(`${BASE_URL}/auth/login`, {
			userId,
			password,
		});
		const { access_token } = res.data;

		localStorage.setItem("authToken", access_token);

		if (onSuccess) onSuccess();
	} catch (err) {
		if (onError) onError("로그인 실패: 아이디나 비밀번호를 확인해주세요.");
	}
};

export const handleLogout = () => {
	localStorage.removeItem("authToken");
	window.location.href = "/";
};

export const fetchUserProfile = async () => {
	const token = localStorage.getItem("authToken");
	if (!token) throw new Error("로그인이 필요한 서비스입니다.");

	const res = await axios.get(`${BASE_URL}/auth/user_info`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});
	return res.data;
};
