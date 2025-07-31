import React, { useEffect, useState } from "react";
import PortfolioList from "./PortfolioList";

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

const samplePortfolios = [
	{
		id: "1",
		assetType: "stock",
		amount: 1000000,
		currency: "KRW",
		purchaseDate: "2023-01-15T00:00:00Z",
		ticker: "AAPL",
		exchange: "NASDAQ",
		quantity: 50,
		purchasePrice: 20000,
	},
	{
		id: "2",
		assetType: "bond",
		amount: 500000,
		currency: "KRW",
		purchaseDate: "2022-06-10T00:00:00Z",
		issuer: "한국국채",
		maturityDate: "2027-06-10T00:00:00Z",
		faceValue: 1000000,
		couponRate: 3.5,
		interestPaymentFreq: "annual",
	},
	{
		id: "3",
		assetType: "fund",
		amount: 750000,
		currency: "KRW",
		purchaseDate: "2023-03-05T00:00:00Z",
		fundName: "국내 ETF",
		fundType: "etf",
		fundCode: "ETF123",
		units: 100,
		purchasePricePerUnit: 7500,
	},
];

const PortfolioDashboard = ({ setActiveTab }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		setIsLoggedIn(!!token);
	}, []);

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
					backgroundColor: "#1e293b",
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
				backgroundColor: "#1e293b",
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

			<PortfolioList portfolios={samplePortfolios} />
		</div>
	);
};

export default PortfolioDashboard;
