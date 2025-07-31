import axios from "axios";
import { BASE_URL } from "../const";

export const submitFeedback = async (feedbackText) => {
	if (!feedbackText.trim()) {
		throw new Error("의견을 입력해주세요.");
	}
	const res = await axios.post(`${BASE_URL}/feedback/add`, feedbackText, {
		headers: {
			"Content-Type": "text/plain",
		},
	});
	return res.data;
};
