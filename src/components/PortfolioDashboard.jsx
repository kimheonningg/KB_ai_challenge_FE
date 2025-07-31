import React from "react";
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
	const handleAddClick = () => {
		window.location.href = "/add_portfolio";
	};

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
