import React, { useState } from "react";

const FeatureTabs = ({ activeTab, setActiveTab }) => {
	const tabs = [
		{ key: "stock", label: "실시간 주식 대시보드", icon: "📊" },
		{ key: "news", label: "실시간 뉴스 분석", icon: "🟢" },
		{ key: "reports", label: "재무제표 분석", icon: "🟣" },
		{ key: "combined", label: "뉴스와 재무제표 통합 분석", icon: "⚡" },
	];

	const [hoverTab, setHoverTab] = useState(null);

	return (
		<div style={{ margin: "1rem", fontFamily: "'Inter', sans-serif" }}>
			<div
				style={{ display: "flex", borderRadius: "0.5rem", overflow: "hidden" }}
			>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.key;
					const isHover = hoverTab === tab.key;
					const baseColor = "#1f2937";
					const hoverColor = "#374151";
					const activeGradient = "linear-gradient(to right, #6366f1, #8b5cf6)";

					return (
						<div
							key={tab.key}
							onClick={() => setActiveTab(tab.key)}
							onMouseEnter={() => setHoverTab(tab.key)}
							onMouseLeave={() => setHoverTab(null)}
							style={{
								cursor: "pointer",
								flex: 1,
								padding: "1rem",
								textAlign: "center",
								color: "white",
								background: isActive
									? activeGradient
									: isHover
									? hoverColor
									: baseColor,
								fontWeight: "bold",
								transition: "all 0.2s ease-in-out",
								border: isActive
									? "1px solid #4f46e5"
									: "1px solid transparent",
								boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
							}}
						>
							<span style={{ marginRight: "0.5rem" }}>{tab.icon}</span>
							{tab.label}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default FeatureTabs;
