import React, { useState, useEffect } from "react";
import { fetchStockChart } from "../utils/alphavantage";
import { useRef } from "react";

const StockChart = ({ symbol, onClose }) => {
	const [chartData, setChartData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [timeframe, setTimeframe] = useState("daily");
	const containerRef = useRef(null);
	const [containerWidth, setContainerWidth] = useState(0);

	useEffect(() => {
		if (!symbol) return;
		
		const loadChartData = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchStockChart(symbol, "TIME_SERIES_DAILY");
				setChartData(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		loadChartData();
	}, [symbol]);

	useEffect(() => {
		const measure = () => {
			if (containerRef.current) {
				setContainerWidth(containerRef.current.clientWidth);
			}
		};
		measure();
		window.addEventListener("resize", measure);
		return () => window.removeEventListener("resize", measure);
	}, []);

	if (loading) {
		return (
			<div style={{
				background: "rgba(13, 27, 42, 0.95)",
				border: "1px solid #1b263b",
				borderRadius: "12px",
				padding: "20px",
				marginTop: "16px",
				textAlign: "center",
				color: "#3b82f6"
			}}>
				<div style={{ fontSize: "16px", marginBottom: "8px" }}>
					<span className="material-icons" style={{ 
						fontSize: "20px", 
						marginRight: "8px",
						animation: "spin 1s linear infinite"
					}}>
						refresh
					</span>
					차트 데이터를 불러오는 중...
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{
				background: "rgba(220, 38, 38, 0.1)",
				border: "1px solid #dc2626",
				borderRadius: "12px",
				padding: "20px",
				marginTop: "16px",
				textAlign: "center",
				color: "#ef4444"
			}}>
				<div style={{ fontSize: "16px" }}>
					<span className="material-icons" style={{ fontSize: "20px", marginRight: "8px" }}>
						error
					</span>
					차트 로딩 실패: {error}
				</div>
			</div>
		);
	}

	if (!chartData || !chartData.data || chartData.data.length === 0) {
		return (
			<div style={{
				background: "rgba(13, 27, 42, 0.95)",
				border: "1px solid #1b263b",
				borderRadius: "12px",
				padding: "20px",
				marginTop: "16px",
				textAlign: "center",
				color: "#94a3b8"
			}}>
				차트 데이터를 사용할 수 없습니다.
			</div>
		);
	}

	// 차트 데이터 준비
	const prices = chartData.data.map(d => d.close);
	const dates = chartData.data.map(d => d.date);
	const minPrice = Math.min(...prices);
	const maxPrice = Math.max(...prices);
	const priceRange = maxPrice - minPrice;

	// 차트 높이와 너비 - 컨테이너 가로폭에 맞춰 100% 채움
	const chartHeight = 250;
	const padding = 30;
	const plotWidth = Math.max(1, (containerWidth || 1500) - 2 * padding);
	const barWidth = Math.max(3, (plotWidth / dates.length) * 0.7);

	// SVG 경로 생성
	const createPath = () => {
		if (prices.length < 2) return "";
		
		const points = prices.map((price, index) => {
			const x = padding + (index / (prices.length - 1)) * plotWidth;
			const y = padding + ((maxPrice - price) / priceRange) * (chartHeight - 2 * padding);
			return `${x},${y}`;
		});
		
		return `M ${points.join(" L ")}`;
	};

	// 캔들스틱 생성
	const createCandlesticks = () => {
		return chartData.data.map((day, index) => {
			const x = padding + (index / (chartData.data.length - 1)) * plotWidth;
			const openY = padding + ((maxPrice - day.open) / priceRange) * (chartHeight - 2 * padding);
			const closeY = padding + ((maxPrice - day.close) / priceRange) * (chartHeight - 2 * padding);
			const highY = padding + ((maxPrice - day.high) / priceRange) * (chartHeight - 2 * padding);
			const lowY = padding + ((maxPrice - day.low) / priceRange) * (chartHeight - 2 * padding);
			
			const isGreen = day.close >= day.open;
			const color = isGreen ? "#10b981" : "#ef4444";
			
			return (
				<g key={index}>
					{/* 위꼬리 */}
					<line
						x1={x}
						y1={highY}
						x2={x}
						y2={Math.min(openY, closeY)}
						stroke={color}
						strokeWidth="1"
					/>
					{/* 아래꼬리 */}
					<line
						x1={x}
						y1={Math.max(openY, closeY)}
						x2={x}
						y2={lowY}
						stroke={color}
						strokeWidth="1"
					/>
					{/* 몸통 */}
					<rect
						x={x - barWidth / 2}
						y={Math.min(openY, closeY)}
						width={barWidth}
						height={Math.abs(closeY - openY)}
						fill={color}
					/>
				</g>
			);
		});
	};

	return (
		<div style={{
			background: "rgba(13, 27, 42, 0.95)",
			border: "1px solid #1b263b",
			borderRadius: "12px",
			padding: "16px",
			marginTop: "12px",
			position: "relative",
			width: "95%",
			marginLeft: "auto",
			marginRight: "auto"
		}}>
			<div style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: "12px"
			}}>
							<h3 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>
				{symbol} 차트 (최근 90일)
			</h3>
				<button
					onClick={onClose}
					style={{
						background: "transparent",
						border: "none",
						color: "#94a3b8",
						cursor: "pointer",
						fontSize: "20px",
						padding: "4px"
					}}
				>
					×
				</button>
			</div>

			<div style={{
				overflowX: "hidden",
				background: "rgba(15, 23, 42, 0.5)",
				borderRadius: "8px",
				padding: "8px",
				maxWidth: "98%",
				width: "98%",
				margin: "0 auto"
			}} ref={containerRef}>
				<svg
					width="100%"
					height={chartHeight + 40}
					style={{ display: "block" }}
					viewBox={`0 0 ${Math.max(1500, containerWidth || 1500)} ${chartHeight + 40}`}
				>
					{/* 그리드 라인 */}
					<defs>
						<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
							<path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.1)" strokeWidth="1"/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#grid)" />

					{/* 가격 축 */}
					<text x="10" y="15" fill="#94a3b8" fontSize="12">
						${maxPrice.toFixed(2)}
					</text>
					<text x="10" y={chartHeight / 2 + 15} fill="#94a3b8" fontSize="12">
						${((maxPrice + minPrice) / 2).toFixed(2)}
					</text>
					<text x="10" y={chartHeight + 15} fill="#94a3b8" fontSize="12">
						${minPrice.toFixed(2)}
					</text>

					{/* 캔들스틱 */}
					{createCandlesticks()}

					{/* 선 그래프 */}
					<path
						d={createPath()}
						fill="none"
						stroke="#3b82f6"
						strokeWidth="2"
						opacity="0.8"
					/>

					{/* 날짜 축 */}
					{dates.map((date, index) => {
						if (index % 10 !== 0) return null; // 10일마다 표시 (90일 데이터에 맞게 조정)
						const x = padding + (index / (dates.length - 1)) * plotWidth;
						const displayDate = new Date(date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
						
						return (
							<text
								key={index}
								x={x}
								y={chartHeight + 30}
								fill="#94a3b8"
								fontSize="10"
								textAnchor="middle"
							>
								{displayDate}
							</text>
						);
					})}
				</svg>
			</div>



			<style jsx>{`
				@keyframes spin {
					from { transform: rotate(0deg); }
					to { transform: rotate(360deg); }
				}
			`}</style>
		</div>
	);
};

export default StockChart;
