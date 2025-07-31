import React from "react";
import PortfolioList from "./PortfolioList";

const samplePortfolios = [
	// FIXME: replace with api connection
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

const PortfolioDashboard = () => {
	return <PortfolioList portfolios={samplePortfolios} />;
};

export default PortfolioDashboard;
