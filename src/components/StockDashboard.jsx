import React, { useState } from "react";
import { fetchQuote, searchSymbol } from "../utils/alphavantage";
import StockInfo from "./StockInfo";

// FIXME: replace using searchSymbol
const MOCK_SUGGESTIONS = [
	{ symbol: "AAPL", name: "Apple Inc." },
	{ symbol: "TSLA", name: "Tesla Inc." },
	{ symbol: "NVDA", name: "NVIDIA Corporation" },
	{ symbol: "GOOGL", name: "Alphabet Inc." },
	{ symbol: "AMZN", name: "Amazon.com Inc." },
];

const StockDashboard = () => {
	const [symbolInput, setSymbolInput] = useState("");
	const [stocks, setStocks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [recent, setRecent] = useState([]);
	const [suggestions, setSuggestions] = useState([]);

	const handleInputChange = (e) => {
		const input = e.target.value;
		setSymbolInput(input);

		const filtered = MOCK_SUGGESTIONS.filter((s) =>
			s.symbol.toLowerCase().startsWith(input.toLowerCase())
		);
		setSuggestions(input.length > 0 ? filtered : []);
	};

	const handleSuggestionClick = (symbol) => {
		setSymbolInput(symbol);
		setSuggestions([]);
	};

	const addStock = async () => {
		const trimmed = symbolInput.trim().toUpperCase();
		if (!trimmed) return;

		setLoading(true);
		try {
			const quote = await fetchQuote(trimmed);
			if (quote && quote["01. symbol"]) {
				setStocks((prev) => [...prev, quote]);
				setRecent((prev) =>
					[trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5)
				);
				setSymbolInput("");
				setSuggestions([]);
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
				padding: "2rem",
				background: "linear-gradient(to bottom, #0f172a, #1e293b)",
				minHeight: "100vh",
				color: "white",
				fontFamily: "'Inter', sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					gap: "1rem",
					marginBottom: "1rem",
					alignItems: "center",
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<div
					style={{
						position: "relative",
						display: "flex",
						alignItems: "center",
						background: "#1e293b",
						border: "1px solid #334155",
						borderRadius: "8px",
						paddingLeft: "0.75rem",
						boxShadow: "0 0 6px rgba(255,255,255,0.05)",
						flex: 1,
						maxWidth: "800px",
					}}
				>
					<span
						className="material-icons"
						style={{ color: "#94a3b8", marginRight: "0.4rem" }}
					>
						search
					</span>
					<input
						type="text"
						placeholder="주식 Symbol 입력 (예: AAPL)"
						value={symbolInput}
						onChange={handleInputChange}
						onKeyDown={(e) => e.key === "Enter" && addStock()}
						style={{
							flex: 1,
							padding: "0.75rem 1rem",
							fontSize: "1rem",
							border: "none",
							outline: "none",
							background: "transparent",
							color: "#f1f5f9",
						}}
					/>
					{suggestions.length > 0 && (
						<ul
							style={{
								position: "absolute",
								top: "100%",
								left: 0,
								width: "100%",
								background: "#1e293b",
								border: "1px solid #334155",
								borderTop: "none",
								borderRadius: "0 0 8px 8px",
								zIndex: 10,
							}}
						>
							{suggestions.map((s) => (
								<li
									key={s.symbol}
									onClick={() => handleSuggestionClick(s.symbol)}
									style={{
										padding: "0.5rem 1rem",
										cursor: "pointer",
										color: "#e2e8f0",
										borderTop: "1px solid #334155",
									}}
								>
									<b>{s.symbol}</b> – {s.name}
								</li>
							))}
						</ul>
					)}
				</div>

				<button
					onClick={addStock}
					style={{
						padding: "0.8rem 1.5rem",
						borderRadius: "8px",
						fontWeight: "bold",
						border: "none",
						cursor: "pointer",
						background: "linear-gradient(to right, #22c55e, #16a34a)",
						color: "white",
						boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
						transition: "all 0.2s ease-in-out",
					}}
					onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
					onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
				>
					검색
				</button>
			</div>

			{recent.length > 0 && (
				<div
					style={{
						marginBottom: "1.5rem",
						fontSize: "0.9rem",
						textAlign: "center",
					}}
				>
					최근 검색:{" "}
					{recent.map((s, i) => (
						<span
							key={s}
							onClick={() => setSymbolInput(s)}
							style={{
								cursor: "pointer",
								marginRight: "0.5rem",
								color: "#38bdf8",
								textDecoration: "underline",
							}}
						>
							{s}
							{i < recent.length - 1 ? "," : ""}
						</span>
					))}
				</div>
			)}

			<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
				{stocks.map((stock) => (
					<StockInfo
						key={stock["01. symbol"]}
						stock={stock}
						onRemove={() => removeStock(stock["01. symbol"])}
					/>
				))}
			</div>

			{loading && (
				<div
					style={{ marginTop: "2rem", textAlign: "center", fontSize: "1.1rem" }}
				>
					⏳ 불러오는 중...
				</div>
			)}
		</div>
	);
};

export default StockDashboard;
