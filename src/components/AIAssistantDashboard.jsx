import React, { useState, useEffect } from "react";
import PortfolioSummarySection from "./AIAssistant/PortfolioSummarySection";
import InsightsSection from "./AIAssistant/InsightsSection";
import ChatSection from "./AIAssistant/ChatSection";
import {
	fetchAllPortfolios,
	calculatePortfolioReturns,
} from "../utils/portfolio";
import LoginRequired from "./LoginRequired";

const AIAssistantDashboard = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(() => {
		return !!localStorage.getItem("authToken");
	});
	const [messages, setMessages] = useState("");
	const [input, setInput] = useState("");
	const [portfolioData, setPortfolioData] = useState({
		totalAsset: "₩0",
		dailyReturn: "0%",
		yearlyReturn: "0%",
		allocation: [
			{ label: "주식", percent: 0, color: "#6678f4" },
			{ label: "채권", percent: 0, color: "#45af79" },
			{ label: "펀드", percent: 0, color: "#d18e48" },
		],
	});
	const [loading, setLoading] = useState(true);

	// 포트폴리오 데이터 로드
	const loadPortfolioData = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("authToken");
			if (!token) {
				setPortfolioData({
					totalAsset: "₩0",
					dailyReturn: "0%",
					yearlyReturn: "0%",
					allocation: [
						{ label: "주식", percent: 0, color: "#6678f4" },
						{ label: "채권", percent: 0, color: "#45af79" },
						{ label: "펀드", percent: 0, color: "#d18e48" },
					],
				});
				return;
			}

			const res = await fetchAllPortfolios();
			const portfolios = res.portfolioList || [];
			const calculatedData = await calculatePortfolioReturns(portfolios);
			setPortfolioData(calculatedData);
		} catch (error) {
			console.error("포트폴리오 데이터 로드 실패:", error);
			// 에러 발생시 기본값 설정
			setPortfolioData({
				totalAsset: "₩0",
				dailyReturn: "0%",
				yearlyReturn: "0%",
				allocation: [
					{ label: "주식", percent: 0, color: "#6678f4" },
					{ label: "채권", percent: 0, color: "#45af79" },
					{ label: "펀드", percent: 0, color: "#d18e48" },
				],
			});
		} finally {
			setLoading(false);
		}
	};

	// 컴포넌트 마운트시 포트폴리오 데이터 로드
	useEffect(() => {
		loadPortfolioData();
	}, []);

	// 포트폴리오 추가 후 데이터 새로고침을 위한 이벤트 리스너
	useEffect(() => {
		const handlePortfolioUpdate = () => {
			loadPortfolioData();
		};

		window.addEventListener("portfolioUpdated", handlePortfolioUpdate);
		return () => {
			window.removeEventListener("portfolioUpdated", handlePortfolioUpdate);
		};
	}, []);

	const handleSend = () => {
		if (!input.trim()) return;
		setMessages((msgs) => [
			...msgs,
			{ id: msgs.length + 1, from: "user", text: input },
		]);
		setInput("");
		// TODO
	};

	const onReport = () => {
		window.location.href = "/create_report";
	};
	const onRisk = () => alert("위험 신호 감지 기능 호출");

	const onSimulate = () => alert("주가 변동 시뮬레이션 기능호출");

	return isLoggedIn ? (
		<div
			style={{
				background:
					"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
				height: "100vh-80px",
				paddingTop: 80,
				paddingBottom: 80,
				paddingLeft: 24,
				paddingRight: 24,
				boxSizing: "border-box",
				display: "flex",
				justifyContent: "center",
				alignItems: "flex-start",
				gap: 24,
			}}
		>
			<div
				style={{
					flex: 1,
					maxWidth: 700,
					display: "flex",
					flexDirection: "column",
					gap: 32,
					color: "#e0e7ff",
					fontFamily: "'Inter', sans-serif",
					minHeight: "calc(100vh - 80px)",
					overflowY: "auto",
				}}
			>
				{loading ? (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "200px",
							color: "#e0e7ff",
							fontSize: "1.1rem",
						}}
					>
						포트폴리오 데이터를 불러오는 중...
					</div>
				) : (
					<PortfolioSummarySection data={portfolioData} />
				)}
				<InsightsSection
					onReport={onReport}
					onRisk={onRisk}
					onSimulate={onSimulate}
				/>
			</div>
			<aside
				style={{
					width: 380,
					background: "rgba(255 255 255 / 0.9)",
					borderRadius: 20,
					padding: 16,
					boxSizing: "border-box",
					boxShadow: "0 6px 20px rgb(16 16 39 / 0.15)",
					display: "flex",
					flexDirection: "column",
					// minHeight: "calc(100vh - 80px)",
					height: "610px",
					fontFamily: "'Inter', sans-serif",
					overflowY: "auto",
				}}
			>
				<ChatSection
					messages={messages}
					onSend={handleSend}
					input={input}
					setInput={setInput}
				/>
			</aside>
		</div>
	) : (
		<LoginRequired />
	);
};

export default AIAssistantDashboard;
