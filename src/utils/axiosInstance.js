// unused for now
import axios from "axios";

import { BASE_URL } from "../const";
import { clearToken } from "./auth";

const axiosInstance = axios.create({
	baseURL: BASE_URL,
});

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			clearToken();
			window.location.href = "/login";
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
