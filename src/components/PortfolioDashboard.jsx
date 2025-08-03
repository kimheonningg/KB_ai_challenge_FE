import React, { useEffect, useState } from "react";
import PortfolioList from "./PortfolioList";
import { fetchAllPortfolios } from "../utils/portfolio";

const headerStyle = {
	display: "flex",
	justifyContent: "flex-end",
	alignItems: "center",
	marginBottom: "1rem",
	color: "#e0e7ff",
	fontFamily: "'Inter', sans-serif",
};

const addButtonStyle = {
	display: "flex",
	alignItems: "center",
	background: "linear-gradient(90deg, #7c3aed, #c084fc)",
	borderRadius: "0.5rem",
	color: "white",
	padding: "0.5rem 1rem",
	fontWeight: "600",
	cursor: "pointer",
	userSelect: "none",
	fontSize: "1rem",
	gap: "0.3rem",
};

const loginMessageStyle = {
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	height: "60vh",
	color: "#cbd5e1",
	fontSize: "1.2rem",
	fontFamily: "'Inter', sans-serif",
};

const loginLinkStyle = {
	color: "#60a5fa",
	cursor: "pointer",
	textDecoration: "underline",
	marginTop: "0.8rem",
	fontWeight: "600",
};

const PortfolioDashboard = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(() => {
		return !!localStorage.getItem("authToken");
	});
	const [portfolios, setPortfolios] = useState([]);

	useEffect(() => {
		if (!isLoggedIn) {
			setPortfolios([]);
			return;
		}

		const fetchData = async () => {
			try {
				const res = await fetchAllPortfolios();
				const list = res.portfolioList || [];
				setPortfolios(list);
			} catch (err) {
				console.error("API fetch error:", err);
				alert(err.message || "포트폴리오 불러오기 실패");
			}
		};
		fetchData();
	}, [isLoggedIn]);

	const handleAddClick = () => {
		if (!isLoggedIn) {
			window.alert("로그인이 필요한 서비스입니다.");
			window.location.href = "/login";
			return;
		}
		window.location.href = "/add_portfolio";
	};

	if (!isLoggedIn) {
		return (
			<div
				style={{
					padding: "1rem 2rem",
					background:
						"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
					minHeight: "calc(100vh - 80px)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<div style={loginMessageStyle}>
					로그인이 필요한 서비스입니다.
					<span
						style={loginLinkStyle}
						onClick={() => (window.location.href = "/login")}
					>
						로그인하러가기
					</span>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				padding: "1rem 2rem",
				background:
					"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
				minHeight: "calc(100vh - 80px)",
			}}
		>
			<div style={headerStyle}>
				<button
					style={addButtonStyle}
					onClick={handleAddClick}
					aria-label="포트폴리오 항목 추가하기"
				>
					<span className="material-icons" style={{ fontSize: "1.3rem" }}>
						add
					</span>
					포트폴리오 항목 추가하기
				</button>
			</div>

			<PortfolioList portfolios={portfolios} />
		</div>
	);
};

export default PortfolioDashboard;
