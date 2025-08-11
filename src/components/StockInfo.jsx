import React, { useEffect, useState } from "react";
import { addFavStock, deleteFavStock, isFavStock } from "../utils/favstocks";
import StockChart from "./StockChart";

const StockInfo = ({ stock, onRemove }) => {
	const ticker = stock["01. symbol"];
	const price = parseFloat(stock["05. price"]);
	const change = parseFloat(stock["09. change"]);
	const changePercent = stock["10. change percent"];

	const isUp = change > 0;
	const changeColor = isUp ? "red" : "blue";

	const [favorited, setFavorited] = useState(
		typeof stock._favorited === "boolean" ? stock._favorited : false
	);
	const [busy, setBusy] = useState(false);
	const [showChart, setShowChart] = useState(false);

	useEffect(() => {
		let mounted = true;
		if (typeof stock._favorited !== "boolean") {
			isFavStock(ticker)
				.then((v) => mounted && setFavorited(!!v))
				.catch(() => {});
		}
		return () => {
			mounted = false;
		};
	}, [ticker, stock._favorited]);

	const toggleFavorite = async (e) => {
		e.stopPropagation();
		if (busy) return;
		const next = !favorited;
		setFavorited(next);
		setBusy(true);
		try {
			if (next) await addFavStock(ticker);
			else await deleteFavStock(ticker);
		} catch (err) {
			setFavorited(!next);
			console.error(err);
			alert("즐겨찾기 저장 중 오류가 발생했습니다.");
		} finally {
			setBusy(false);
		}
	};

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
				width: "100%",
				boxSizing: "border-box",
			}}
		>
			<div style={{ fontSize: "20px", fontWeight: "bold" }}>
				{ticker}{" "}
				<span style={{ fontWeight: "normal", fontSize: "14px", color: "#aaa" }}>
					{ticker === "AAPL"
						? "Apple Inc."
						: ticker === "GOOGL"
						? "Alphabet Inc."
						: ticker === "MSFT"
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

			{/* 차트 표시 버튼 */}
			<button
				onClick={() => setShowChart(!showChart)}
				style={{
					position: "absolute",
					right: "60px",
					top: "10px",
					background: "transparent",
					border: "none",
					cursor: "pointer",
					fontSize: "16px",
					color: showChart ? "#3b82f6" : "#94a3b8",
					padding: "4px",
					borderRadius: "4px",
					transition: "all 0.2s ease"
				}}
				title={showChart ? "차트 숨기기" : "차트 보기"}
			>
				<span className="material-icons" style={{ fontSize: "18px" }}>
					{showChart ? "visibility_off" : "show_chart"}
				</span>
			</button>

			<button
				title={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
				onClick={toggleFavorite}
				disabled={busy}
				style={{
					position: "absolute",
					right: "36px",
					top: "10px",
					background: "transparent",
					border: "none",
					cursor: "pointer",
					fontSize: "18px",
					lineHeight: 1,
					color: favorited ? "#facc15" : "#ccc",
					width: "1px",
					marginRight: "5px",
				}}
				aria-label="toggle favorite"
			>
				{favorited ? "★" : "☆"}
			</button>

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
				aria-label="close"
			>
				×
			</button>

			{/* 차트 표시 */}
			{showChart && (
				<StockChart 
					symbol={ticker} 
					onClose={() => setShowChart(false)} 
				/>
			)}
		</div>
	);
};

export default StockInfo;
