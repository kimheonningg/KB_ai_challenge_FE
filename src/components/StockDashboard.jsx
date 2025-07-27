import React, { useState } from "react";
import { fetchQuote } from "../utils/alphavantage";
import StockInfo from "./StockInfo";

const StockDashboard = () => {
	const [symbolInput, setSymbolInput] = useState("");
	const [stocks, setStocks] = useState([]);
	const [loading, setLoading] = useState(false);

	const addStock = async () => {
		if (!symbolInput) return;
		setLoading(true);
		try {
			const quote = await fetchQuote(symbolInput.toUpperCase());
			if (quote && quote["01. symbol"]) {
				setStocks((prev) => [...prev, quote]);
				setSymbolInput("");
			}
		} catch (e) {
			alert("조회 실패: " + e.message);
		}
		setLoading(false);
	};

	const removeStock = (symbol) => {
		setStocks((prev) => prev.filter((s) => s["01. symbol"] !== symbol));
	};

	return (
		<div
			style={{
				padding: "24px",
				background: "#1a1a2e",
				minHeight: "100vh",
				color: "white",
			}}
		>
			<h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
				📊 실시간 주식 대시보드{" "}
				<span style={{ fontSize: "14px", color: "#aaa" }}>
					Alpha Vantage API 기반
				</span>
			</h1>

			<div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
				<input
					type="text"
					placeholder="주식 심볼 입력 (예: AAPL)"
					value={symbolInput}
					onChange={(e) => setSymbolInput(e.target.value)}
					style={{ flex: 1, padding: "8px", fontSize: "16px" }}
				/>
				<button
					onClick={addStock}
					style={{ padding: "8px 12px", background: "green", color: "white" }}
				>
					추가
				</button>
			</div>

			{stocks.map((stock) => (
				<StockInfo
					key={stock["01. symbol"]}
					stock={stock}
					onRemove={() => removeStock(stock["01. symbol"])}
				/>
			))}

			{loading && <div style={{ marginTop: "20px" }}>⏳ 불러오는 중...</div>}
		</div>
	);
};

export default StockDashboard;
