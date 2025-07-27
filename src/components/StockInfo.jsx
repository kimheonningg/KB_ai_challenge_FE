import React from "react";

const StockInfo = ({ stock, onRemove }) => {
	const price = parseFloat(stock["05. price"]);
	const change = parseFloat(stock["09. change"]);
	const changePercent = stock["10. change percent"];

	const isUp = change > 0;
	const changeColor = isUp ? "red" : "blue";

	return (
		<div
			style={{
				background: "#0d1b2a",
				border: "1px solid #1b263b",
				padding: "16px",
				marginBottom: "8px",
				borderRadius: "8px",
				color: "white",
				position: "relative",
			}}
		>
			<div style={{ fontSize: "20px", fontWeight: "bold" }}>
				{stock["01. symbol"]}{" "}
				<span style={{ fontWeight: "normal", fontSize: "14px", color: "#aaa" }}>
					{stock["01. symbol"] === "AAPL"
						? "Apple Inc."
						: stock["01. symbol"] === "GOOGL"
						? "Alphabet Inc."
						: stock["01. symbol"] === "MSFT"
						? "Microsoft Corporation"
						: ""}
				</span>
			</div>
			<div style={{ fontSize: "24px", marginTop: "4px" }}>
				${price.toFixed(2)}
				<span
					style={{ color: changeColor, marginLeft: "10px", fontSize: "16px" }}
				>
					{isUp ? "▲" : "▼"} {change.toFixed(2)} ({changePercent})
				</span>
			</div>
			<button
				style={{
					position: "absolute",
					right: "12px",
					top: "12px",
					background: "transparent",
					color: "#ccc",
					border: "none",
					cursor: "pointer",
					fontSize: "16px",
				}}
				onClick={onRemove}
			>
				×
			</button>
		</div>
	);
};

export default StockInfo;
