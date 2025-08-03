import React from "react";

const ChatMessage = ({ from, text }) => {
	const isUser = from === "user";

	return (
		<div
			style={{
				alignSelf: isUser ? "flex-end" : "flex-start",
				maxWidth: "70%",
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

const ChatSection = ({ messages, onSend, input, setInput }) => (
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
			overflow: "hidden",
		}}
	>
		<h3
			style={{
				fontWeight: "700",
				fontSize: 18,
				color: "#333",
				marginBottom: 12,
				display: "flex",
				alignItems: "center",
				gap: 8,
			}}
		>
			<span
				style={{
					backgroundColor: "#e2e2e2",
					borderRadius: 4,
					padding: "0 6px",
					fontWeight: "700",
					fontSize: 14,
					color: "#444",
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					width: 22,
					height: 22,
				}}
			>
				♟
			</span>{" "}
			AI 투자 상담
		</h3>

		<div
			style={{
				flex: 1,
				overflowY: "auto",
				paddingRight: 8,
				marginBottom: 12,
				display: "flex",
				flexDirection: "column",
				gap: 8,
			}}
		>
			{messages.map(({ id, from, text }) => (
				<ChatMessage key={id} from={from} text={text} />
			))}
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
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						onSend();
					}
				}}
			/>
			<button
				onClick={onSend}
				style={{
					backgroundColor: "#6776f4",
					color: "white",
					borderRadius: 16,
					border: "none",
					padding: "10px 20px",
					fontWeight: "700",
					cursor: "pointer",
					userSelect: "none",
				}}
			>
				전송
			</button>
		</div>
	</section>
);

export default ChatSection;
