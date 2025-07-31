import React from "react";

const containerStyle = {
	padding: "1rem 2rem",
	backgroundColor: "#1e293b",
	minHeight: "calc(100vh - 80px)",
	color: "#f1f5f9",
	fontFamily: "'Inter', sans-serif",
	display: "flex",
	gap: "1rem",
	boxSizing: "border-box",
};

const columnStyle = {
	flex: 1,
	display: "flex",
	flexDirection: "column",
	maxHeight: "80vh",
	overflowY: "auto",
};

const columnHeaderStyle = {
	fontSize: "1.3rem",
	fontWeight: "700",
	color: "#93c5fd",
	marginBottom: "1rem",
	borderBottom: "2px solid #6366f1",
	paddingBottom: "0.5rem",
	textAlign: "center",
};

const cardStyle = {
	backgroundColor: "#0f172a",
	borderRadius: "1rem",
	padding: "1rem 1.5rem",
	marginBottom: "1rem",
	boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
	border: "1px solid #334155",
	display: "flex",
	flexDirection: "column",
	gap: "0.5rem",
};

const fieldRowStyle = {
	display: "flex",
	justifyContent: "space-between",
	fontSize: "0.9rem",
	color: "#cbd5e1",
};

const labelStyle = {
	fontWeight: "600",
	color: "#94a3b8",
};

const PortfolioCard = ({ portfolio }) => {
	const {
		assetType,
		amount,
		currency,
		purchaseDate,
		ticker,
		exchange,
		quantity,
		purchasePrice,
		issuer,
		maturityDate,
		faceValue,
		couponRate,
		interestPaymentFreq,
		fundName,
		fundType,
		fundCode,
		units,
		purchasePricePerUnit,
	} = portfolio;

	return (
		<div style={cardStyle}>
			<div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#93c5fd" }}>
				{assetType === "stock" && `${ticker || "N/A"}`}
				{assetType === "bond" && `${issuer || "N/A"}`}
				{assetType === "fund" && `${fundName || "N/A"}`}
			</div>
			<div style={fieldRowStyle}>
				<div>
					<span style={labelStyle}>투자금액: </span>
					{amount.toLocaleString()} {currency}
				</div>
				<div>
					<span style={labelStyle}>매수일: </span>
					{new Date(purchaseDate).toLocaleDateString()}
				</div>
			</div>

			{assetType === "stock" && (
				<>
					<div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>거래소: </span>
							{exchange || "N/A"}
						</div>
						<div>
							<span style={labelStyle}>보유 수량: </span>
							{quantity || "-"}
						</div>
					</div>
					<div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>매입가: </span>
							{purchasePrice ? purchasePrice.toLocaleString() : "-"} {currency}
						</div>
					</div>
				</>
			)}

			{assetType === "bond" && (
				<>
					<div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>만기일: </span>
							{maturityDate ? new Date(maturityDate).toLocaleDateString() : "-"}
						</div>
						<div>
							<span style={labelStyle}>액면가: </span>
							{faceValue ? faceValue.toLocaleString() : "-"} {currency}
						</div>
					</div>
					<div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>쿠폰 이자율: </span>
							{couponRate ? `${couponRate}%` : "-"}
						</div>
						<div>
							<span style={labelStyle}>이자 지급 주기: </span>
							{interestPaymentFreq || "-"}
						</div>
					</div>
				</>
			)}

			{assetType === "fund" && (
				<>
					<div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>펀드 유형: </span>
							{fundType || "-"}
						</div>
						<div>
							<span style={labelStyle}>펀드 코드: </span>
							{fundCode || "-"}
						</div>
					</div>
					<div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>보유 좌수: </span>
							{units || "-"}
						</div>
						<div>
							<span style={labelStyle}>매입 단가: </span>
							{purchasePricePerUnit
								? purchasePricePerUnit.toLocaleString()
								: "-"}{" "}
							{currency}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

const PortfolioList = ({ portfolios }) => {
	const stocks = portfolios.filter((p) => p.assetType === "stock");
	const bonds = portfolios.filter((p) => p.assetType === "bond");
	const funds = portfolios.filter((p) => p.assetType === "fund");

	return (
		<div style={containerStyle}>
			<div style={columnStyle}>
				<div style={columnHeaderStyle}>주식</div>
				{stocks.length === 0 ? (
					<p style={{ color: "#64748b", textAlign: "center" }}>없음</p>
				) : (
					stocks.map((p, idx) => <PortfolioCard key={idx} portfolio={p} />)
				)}
			</div>
			<div style={columnStyle}>
				<div style={columnHeaderStyle}>채권</div>
				{bonds.length === 0 ? (
					<p style={{ color: "#64748b", textAlign: "center" }}>없음</p>
				) : (
					bonds.map((p, idx) => <PortfolioCard key={idx} portfolio={p} />)
				)}
			</div>
			<div style={columnStyle}>
				<div style={columnHeaderStyle}>펀드</div>
				{funds.length === 0 ? (
					<p style={{ color: "#64748b", textAlign: "center" }}>없음</p>
				) : (
					funds.map((p, idx) => <PortfolioCard key={idx} portfolio={p} />)
				)}
			</div>
		</div>
	);
};

export default PortfolioList;
