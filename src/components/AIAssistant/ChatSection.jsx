import React, { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../../utils/chatbot";

import "../../styles/aiAssistantPageComponents.css";

const ChatMessage = ({ from, text }) => {
	const isUser = from === "user";

	return (
		<div
			style={{
				alignSelf: isUser ? "flex-end" : "flex-start",
				backgroundColor: isUser ? "#6776f4" : "#e5e8ee",
				color: isUser ? "white" : "#444",
				padding: "10px 16px",
				borderRadius: 18,
				borderTopLeftRadius: isUser ? 18 : 4,
				borderTopRightRadius: isUser ? 4 : 18,
				fontSize: 14,
				whiteSpace: "pre-line",
				wordBreak: "break-word",
			}}
		>
			{text}
		</div>
	);
};

const ChatSection = ({ messages: initialMessages, input, setInput }) => {
	const [messages, setMessages] = useState(initialMessages || []);
	const [loading, setLoading] = useState(false);
	const nextId = useRef(messages.length);
	const scrollRef = useRef(null);

	const onSend = async () => {
		if (!input.trim()) return;

		const userMsg = { id: nextId.current++, from: "user", text: input.trim() };
		const updatedMessages = [...messages, userMsg];
		setMessages(updatedMessages);
		setInput("");
		setLoading(true);

		const previousChat = updatedMessages.map(({ from, text }) => ({
			role: from === "user" ? "user" : "assistant",
			content: text,
		}));

		try {
			const chatList = await sendChatMessage(previousChat);

			const newMessages = chatList.map(({ role, content }, idx) => ({
				id: idx,
				from: role === "user" ? "user" : "assistant",
				text: content,
			}));

			setMessages(newMessages);
			nextId.current = newMessages.length;
		} catch (err) {
			console.error(err);
			setMessages((msgs) => [
				...msgs,
				{
					id: nextId.current++,
					from: "assistant",
					text: "죄송합니다, 서버와 통신 중 문제가 발생했습니다.",
				},
			]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<section
			style={{
				flex: 1,
				background: "rgba(255 255 255 / 0.9)",
				borderRadius: 20,
				padding: 16,
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				gap: 12,
				boxShadow: "0 6px 20px rgb(16 16 39 / 0.15)",
				height: "100%",
			}}
		>
			<h3
				style={{
					fontWeight: "700",
					fontSize: 18,
					color: "#333",
					marginBottom: 12,
					display: "flex",
					flexDirection: "column",
					gap: 8,
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						gap: 10,
						alignItems: "center",
					}}
				>
					<span className="material-icon-badge">
						<span className="material-icons">smart_toy</span>
					</span>
					AI 투자 상담
				</div>
				<div
					style={{
						fontWeight: "700",
						fontSize: 10,
						color: "#333",
						textAlign: "left",
						width: "100%",
					}}
				>
					궁금한 점이 있다면 챗봇에게 자유롭게 질문해주세요!
				</div>
			</h3>

			<div
				ref={scrollRef}
				style={{
					flex: 1,
					overflowY: "auto",
					paddingRight: 8,
					marginBottom: 12,
					display: "flex",
					flexDirection: "column",
					gap: 8,
					minHeight: 0,
				}}
			>
				{messages.map(({ id, from, text }) => (
					<ChatMessage key={id} from={from} text={text} />
				))}

				{loading && (
					<div
						style={{
							alignSelf: "flex-start",
							backgroundColor: "#e5e8ee",
							color: "#444",
							padding: "10px 16px",
							borderRadius: 18,
							borderTopLeftRadius: 4,
							borderTopRightRadius: 18,
							fontSize: 14,
							fontStyle: "italic",
						}}
					>
						<span
							className="material-icons"
							style={{ verticalAlign: "middle", marginRight: 8 }}
						>
							hourglass_top
						</span>
						잠시 기다려주세요...
					</div>
				)}
			</div>

			<div style={{ display: "flex", gap: 8 }}>
				<input
					type="text"
					placeholder="투자 관련 질문을 입력하세요..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					style={{
						flex: 1,
						borderRadius: 16,
						border: "1px solid #a3a3a3",
						padding: "10px 16px",
						fontSize: 14,
						outline: "none",
						lineHeight: "20px",
						height: 40,
						boxSizing: "border-box",
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							onSend();
						}
					}}
					disabled={loading}
				/>
				<button
					onClick={onSend}
					disabled={loading}
					style={{
						backgroundColor: "#6776f4",
						color: "white",
						borderRadius: 16,
						border: "none",
						padding: "10px 20px",
						fontWeight: "700",
						cursor: loading ? "not-allowed" : "pointer",
						userSelect: "none",
					}}
				>
					전송
				</button>
			</div>
		</section>
	);
};

export default ChatSection;
