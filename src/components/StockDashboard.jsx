import React, { useState, useEffect } from "react";
import { fetchQuote } from "../utils/alphavantage";
import StockInfo from "./StockInfo";
import { MOCK_SUGGESTIONS } from "../const";
import { getFavStocks } from "../utils/favstocks";

const StockDashboard = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(
		() => !!localStorage.getItem("authToken")
	);
	const [symbolInput, setSymbolInput] = useState("");
	const [stocks, setStocks] = useState([]);
	const [loading, setLoading] = useState(false);
	const [initLoading, setInitLoading] = useState(false);
	const [recent, setRecent] = useState([]);
	const [suggestions, setSuggestions] = useState([]);

	useEffect(() => {
		const onStorage = (e) => {
			if (e.key === "authToken") {
				setIsLoggedIn(!!localStorage.getItem("authToken"));
				if (!localStorage.getItem("authToken")) {
					setStocks([]);
					setRecent([]);
				}
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	useEffect(() => {
		if (!isLoggedIn) return;
		(async () => {
			try {
				setInitLoading(true);
				const tickers = await getFavStocks();
				if (!tickers.length) return;

				const settled = await Promise.allSettled(
					tickers.map((t) => fetchQuote(t))
				);
				const loaded = settled
					.filter(
						(r) => r.status === "fulfilled" && r.value && r.value["01. symbol"]
					)
					.map((r) => ({ ...r.value, _favorited: true }));

				if (loaded.length) setStocks((prev) => [...prev, ...loaded]);
			} finally {
				setInitLoading(false);
			}
		})();
	}, [isLoggedIn]);

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
		addStock(symbol);
	};

	const addStock = async () => {
		const trimmed = symbolInput.trim().toUpperCase();
		if (!trimmed) return;

		if (stocks.some((s) => s["01. symbol"] === trimmed)) {
			setRecent((prev) =>
				[trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, 5)
			);
			setSymbolInput("");
			setSuggestions([]);
			return;
		}

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
				background:
					"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
				minHeight: "100vh",
				color: "#f8fafc",
				fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					gap: "1rem",
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
						background:
							"linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.8) 100%)",
						border: "1px solid rgba(148, 163, 184, 0.3)",
						borderRadius: "16px",
						paddingLeft: "1rem",
						boxShadow:
							"0 10px 15px -3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
						flex: 1,
						// maxWidth: "960px",
						backdropFilter: "blur(10px)",
						transition: "all 0.3s ease",
						zIndex: 20,
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
						e.currentTarget.style.boxShadow =
							"0 10px 15px -3px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.3)";
						e.currentTarget.style.boxShadow =
							"0 10px 15px -3px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
					}}
				>
					<span
						className="material-icons"
						style={{
							color: "#3b82f6",
							marginRight: "0.5rem",
							fontSize: "1.2rem",
						}}
					>
						search
					</span>
					<input
						type="text"
						placeholder="주식 Symbol 입력 (예: AAPL, TSLA, NVDA)"
						value={symbolInput}
						onChange={handleInputChange}
						onKeyDown={(e) => e.key === "Enter" && addStock()}
						style={{
							flex: 1,
							padding: "1rem 1.5rem",
							fontSize: "1.1rem",
							border: "none",
							outline: "none",
							background: "transparent",
							color: "#f8fafc",
							fontWeight: "500",
							letterSpacing: "0.025em",
						}}
					/>
					{suggestions.length > 0 && !loading && (
						<ul
							style={{
								position: "absolute",
								top: "100%",
								left: 0,
								right: 0,
								background:
									"linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
								border: "1px solid rgba(59, 130, 246, 0.3)",
								borderTop: "none",
								borderRadius: "0 0 16px 16px",
								zIndex: 9999,
								backdropFilter: "blur(20px)",
								boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
								overflow: "hidden",
								marginTop: "2px",
							}}
						>
							{suggestions.map((s, index) => (
								<li
									key={s.symbol}
									onClick={() => handleSuggestionClick(s.symbol)}
									style={{
										padding: "0.75rem 1rem",
										cursor: "pointer",
										color: "#cbd5e1",
										borderTop:
											index > 0 ? "1px solid rgba(71, 85, 105, 0.3)" : "none",
										transition: "all 0.2s ease",
										fontSize: "0.95rem",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background =
											"linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)";
										e.currentTarget.style.color = "#f8fafc";
										e.currentTarget.style.transform = "translateX(4px)";
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = "transparent";
										e.currentTarget.style.color = "#cbd5e1";
										e.currentTarget.style.transform = "translateX(0)";
									}}
								>
									<strong style={{ color: "#3b82f6" }}>{s.symbol}</strong>
									<span style={{ color: "#94a3b8", marginLeft: "0.5rem" }}>
										– {s.name}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				<button
					onClick={addStock}
					disabled={loading}
					style={{
						padding: "1rem 2rem",
						borderRadius: "16px",
						alignItems: "center",
						justifyContent: "center",
						fontWeight: "600",
						fontSize: "1rem",
						border: "none",
						cursor: loading ? "not-allowed" : "pointer",
						background: loading
							? "linear-gradient(135deg, #64748b 0%, #475569 100%)"
							: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
						color: "white",
						boxShadow: loading
							? "0 4px 6px -1px rgba(0, 0, 0, 0.2)"
							: "0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(139, 92, 246, 0.3)",
						transition: "all 0.3s ease",
						letterSpacing: "0.025em",
						opacity: loading ? 0.7 : 1,
						zIndex: 1,
					}}
					onMouseEnter={(e) => {
						if (!loading) {
							e.target.style.transform = "translateY(-2px) scale(1.02)";
							e.target.style.boxShadow =
								"0 20px 25px -5px rgba(59, 130, 246, 0.5), 0 10px 10px -5px rgba(139, 92, 246, 0.4)";
						}
					}}
					onMouseLeave={(e) => {
						if (!loading) {
							e.target.style.transform = "translateY(0) scale(1)";
							e.target.style.boxShadow =
								"0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(139, 92, 246, 0.3)";
						}
					}}
				>
					{loading ? (
						<>
							<span
								className="material-icons"
								style={{
									fontSize: "1rem",
									marginRight: "0.5rem",
									animation: "spin 1s linear infinite",
								}}
							>
								refresh
							</span>
							검색 중...
						</>
					) : initLoading ? (
						<>
							<span
								className="material-icons"
								style={{
									fontSize: "1rem",
									marginRight: "0.5rem",
									animation: "spin 1s linear infinite",
								}}
							>
								refresh
							</span>
							로딩 중...
						</>
					) : (
						<>검색</>
					)}
				</button>
			</div>

			{recent.length > 0 && (
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						margin: "0.5rem",
						gap: "0.5rem",
						flexWrap: "wrap",
						zIndex: suggestions.length > 0 ? 0 : 5,
						opacity: suggestions.length > 0 ? 0.2 : 1,
						// pointerEvents: suggestions.length > 0 ? "none" : "auto",
					}}
				>
					<div
						style={{
							fontSize: "0.9rem",
							color: "#94a3b8",
							fontWeight: "500",
							whiteSpace: "nowrap",
						}}
					>
						최근 검색 기록:
					</div>
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "0.5rem",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{recent.map((s, i) => (
							<span
								key={s}
								onClick={() => setSymbolInput(s)}
								style={{
									cursor: "pointer",
									padding: "0.5rem 1rem",
									background:
										"linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)",
									color: "#3b82f6",
									borderRadius: "20px",
									fontSize: "0.85rem",
									fontWeight: "600",
									border: "1px solid rgba(59, 130, 246, 0.3)",
									transition: "all 0.2s ease",
									backdropFilter: "blur(10px)",
								}}
								onMouseEnter={(e) => {
									e.target.style.transform = "translateY(-1px) scale(1.05)";
									e.target.style.boxShadow =
										"0 4px 6px -1px rgba(59, 130, 246, 0.3)";
								}}
								onMouseLeave={(e) => {
									e.target.style.transform = "translateY(0) scale(1)";
									e.target.style.boxShadow = "none";
								}}
							>
								{s}
							</span>
						))}
					</div>
				</div>
			)}

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					marginTop: "1.5rem",
				}}
			>
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
					style={{
						fontSize: "1.2rem",
						color: "#3b82f6",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "0.75rem",
						marginTop: "5rem",
					}}
				>
					<span
						className="material-icons"
						style={{
							fontSize: "1.5rem",
							animation: "spin 1s linear infinite",
						}}
					>
						refresh
					</span>
					⏳ 데이터를 불러오는 중입니다...
				</div>
			)}

			<style jsx>{`
				@keyframes spin {
					from {
						transform: rotate(0deg);
					}
					to {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	);
};

export default StockDashboard;
