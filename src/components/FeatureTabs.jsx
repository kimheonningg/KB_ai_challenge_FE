import React from "react";

const FeatureTabs = ({ activeTab, setActiveTab }) => {
	const tabs = [
		{ key: "stock", label: "실시간 주식 대시보드", icon: "📊", gradient: true },
		{ key: "news", label: "실시간 뉴스 분석", icon: "🟢", gradient: true },
		{ key: "reports", label: "재무제표 분석", icon: "🟣", gradient: true },
		{
			key: "combined",
			label: "뉴스와 재무제표 통합 분석",
			icon: "⚡",
			gradient: true,
		},
	];

	return (
		<div style={{ margin: "1rem", fontFamily: "'Inter', sans-serif" }}>
			<div
				style={{ display: "flex", borderRadius: "0.5rem", overflow: "hidden" }}
			>
				{tabs.map((tab) => (
					<div
						key={tab.key}
						onClick={() => setActiveTab(tab.key)}
						style={{
							cursor: "pointer",
							flex: 1,
							padding: "1rem",
							textAlign: "center",
							color: "white",
							background:
								activeTab === tab.key
									? "linear-gradient(to right, #6366f1, #8b5cf6)"
									: "#1f2937",
							fontWeight: "bold",
							transition: "all 0.2s",
							border:
								activeTab === tab.key
									? "1px solid #4f46e5"
									: "1px solid transparent",
						}}
					>
						<span style={{ marginRight: "0.5rem" }}>{tab.icon}</span>
						{tab.label}
					</div>
				))}
			</div>
		</div>
	);
};

export default FeatureTabs;
