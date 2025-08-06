import axios from "axios";
import { BASE_URL } from "../const";

export const sendChatMessage = async (previousChat) => {
	console.log("previous chat: ", previousChat);
	try {
		const token = localStorage.getItem("authToken");
		if (!token) throw new Error("로그인이 필요한 서비스입니다.");

		const res = await axios.post(
			`${BASE_URL}/chatbot/new`,
			{ previousChat },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);
		return res.data.chat_list;
	} catch (error) {
		throw error;
	}
};
