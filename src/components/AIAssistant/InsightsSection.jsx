import React from "react";

const buttonStyle = {
	flex: 1,
	padding: "12px 16px",
	margin: "0 8px",
	background: "#6776f4",
	borderRadius: "0.8rem",
	color: "white",
	fontWeight: "600",
	fontSize: "1rem",
	cursor: "pointer",
	border: "none",
	userSelect: "none",
	transition: "background-color 0.3s ease",
	boxShadow: "0 4px 12px rgb(103 118 244 / 0.5)",
};

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
	fontWeight: "700",
	fontSize: 18,
	display: "flex",
	alignItems: "center",
	gap: 8,
	marginBottom: 8,
	color: "#222",
};

const iconStyle = {
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
};

const InsightsSection = ({ onReport, onRiskRebalance, onSimulate }) => {
	return (
		<section style={containerStyle}>
			<h3 style={headerStyle}>
				<span style={iconStyle}>📊</span> 인사이트 및 투자 전략 제공
			</h3>
			<div style={{ display: "flex", gap: 16 }}>
				<button style={buttonStyle} onClick={onReport}>
					자동 리포트 생성
				</button>
				<button style={buttonStyle} onClick={onRiskRebalance}>
					위험 신호 감지 및 <br />
					리밸런싱
				</button>
				<button style={buttonStyle} onClick={onSimulate}>
					주가 변동 시뮬레이션
				</button>
			</div>
		</section>
	);
};

export default InsightsSection;
