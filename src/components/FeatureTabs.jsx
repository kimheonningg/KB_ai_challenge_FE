import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const FeatureTabs = ({ activeTab, setActiveTab }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const tabs = [
		{ key: "portfolio", label: "포트폴리오 관리", icon: "pie_chart" },
		{ key: "stock", label: "실시간 주식 대시보드", icon: "insights" },
		{ key: "insight", label: "AI 어시스턴트", icon: "support_agent" },
	];

	const [hoverTab, setHoverTab] = useState(null);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const tab = params.get("tab");
		if (tab && tab !== activeTab) {
			setActiveTab(tab);
		}
	}, [location.search, activeTab, setActiveTab]);

	const onTabClick = (key) => {
		setActiveTab(key);
		navigate(`/?tab=${key}`, { replace: true });
	};

	return (
		<div style={{ margin: "1rem", fontFamily: "'Inter', sans-serif" }}>
			<div
				style={{
					display: "flex",
					borderRadius: "0.5rem",
					overflow: "hidden",
				}}
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
							onClick={() => onTabClick(tab.key)}
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
							<span
								className="material-icons"
								style={{ marginRight: "0.5rem", verticalAlign: "middle" }}
							>
								{tab.icon}
							</span>
							{tab.label}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default FeatureTabs;
