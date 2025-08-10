import React from "react";

import "../../styles/aiAssistantPageComponents.css";

const containerStyle = {
	background: "white",
	borderRadius: 20,
	padding: 24,
	color: "#222",
	fontFamily: "'Inter', sans-serif",
	boxShadow: "0 6px 20px rgb(16 16 39 / 0.15)",
	display: "flex",
	flexDirection: "column",
	gap: 24,
	boxSizing: "border-box",
};

const headerStyle = {
	fontWeight: 700,
	fontSize: 18,
	display: "flex",
	alignItems: "center",
	gap: 10,
	marginBottom: 8,
	color: "#222",
};

const iconInner = {
	fontSize: "1.3rem",
	backgroundColor: "#e2e2e2",
	borderRadius: 4,
	padding: "5px 10px",
	fontWeight: "700",
	color: "#444",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	width: 22,
	height: 22,
	lineHeight: 1,
};

const gridStyle = {
	display: "grid",
	gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
	gap: 16,
};

const buttonStyle = {
	width: "100%",
	minHeight: 70,
	padding: "12px 16px",
	background: "#6776f4",
	borderRadius: "0.8rem",
	color: "white",
	fontWeight: 600,
	fontSize: "1rem",
	cursor: "pointer",
	border: "none",
	userSelect: "none",
	transition: "transform 0.15s ease, box-shadow 0.2s ease",
	boxShadow: "0 4px 12px rgb(103 118 244 / 0.5)",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	textAlign: "center",
	lineHeight: 1.35,
};

const onButtonEnter = (e) => {
	e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
	e.currentTarget.style.boxShadow =
		"0 20px 25px -5px rgba(59,130,246,0.5), 0 10px 10px -5px rgba(139,92,246,0.4)";
};
const onButtonLeave = (e) => {
	e.currentTarget.style.transform = "translateY(0) scale(1)";
	e.currentTarget.style.boxShadow = "0 4px 12px rgb(103 118 244 / 0.5)";
};

const InsightsSection = ({
	onInsight,
	onReport,
	onRiskRebalance,
	onSimulate,
}) => {
	return (
		<section style={containerStyle}>
			<h3 style={headerStyle}>
				<span className="material-icon-badge">
					<span className="material-icons" style={iconInner}>
						assessment
					</span>
				</span>
				인사이트 및 투자 전략 제공
			</h3>

			<div style={gridStyle}>
				<button
					style={buttonStyle}
					onClick={onInsight}
					onMouseEnter={onButtonEnter}
					onMouseLeave={onButtonLeave}
				>
					인사이트 얻기
				</button>

				<button
					style={buttonStyle}
					onClick={onReport}
					onMouseEnter={onButtonEnter}
					onMouseLeave={onButtonLeave}
				>
					자동 리포트 생성
				</button>

				<button
					style={buttonStyle}
					onClick={onRiskRebalance}
					onMouseEnter={onButtonEnter}
					onMouseLeave={onButtonLeave}
				>
					위험 신호 감지 및 리밸런싱
				</button>

				<button
					style={buttonStyle}
					onClick={onSimulate}
					onMouseEnter={onButtonEnter}
					onMouseLeave={onButtonLeave}
				>
					주가 변동 시뮬레이션
				</button>
			</div>
		</section>
	);
};

export default InsightsSection;
