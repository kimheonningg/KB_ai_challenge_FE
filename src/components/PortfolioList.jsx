import React, { useState, useEffect } from "react";
import { fetchQuote, fetchHistoricalPrice } from "../utils/alphavantage";
import { deletePortfolio } from "../utils/portfolio";

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
	position: "sticky",
	top: 0,
	backgroundColor: "#1e293b",
	zIndex: 10,
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
	position: "relative",
};

const fieldRowStyle = {
	display: "flex",
	justifyContent: "space-between",
	fontSize: "0.9rem",
	color: "#cbd5e1",
	paddingTop: "10px",
};

const labelStyle = {
	fontWeight: "600",
	color: "#94a3b8",
};

const returnStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	padding: "0.5rem",
	backgroundColor: "rgba(255,255,255,0.05)",
	borderRadius: "0.5rem",
	marginTop: "0.5rem",
};

const trashIconStyle = {
	cursor: "pointer",
	fontSize: "1.5rem",
	color: "#ef4444",
	userSelect: "none",
	transition: "color 0.2s ease",
};

const deleteButtonStyle = {
	background: "linear-gradient(45deg, #ef4444, #dc2626)",
	border: "none",
	borderRadius: "0.5rem",
	color: "white",
	padding: "0.3rem 0.7rem",
	marginRight: "0.1rem",
	cursor: "pointer",
	fontWeight: "600",
	fontSize: "0.9rem",
};

const deleteGoBackButtonStyle = {
	backgroundColor: "#4ade80",
	border: "1px solid #64748b",
	borderRadius: "0.5rem",
	color: "#64748b",
	padding: "0.3rem 0.7rem",
	cursor: "pointer",
	fontWeight: "600",
	fontSize: "0.9rem",
};

const deleteWrapperStyle = {
	position: "absolute",
	top: "0.5rem",
	right: "0.5rem",
	display: "flex",
	alignItems: "center",
	gap: "0.3rem",
};

const PortfolioCard = ({ portfolio, onDelete }) => {
	const [currentValue, setCurrentValue] = useState(null);
	const [returnPercent, setReturnPercent] = useState(null);
	const [purchasePrice, setPurchasePrice] = useState(null);
	const [currentPrice, setCurrentPrice] = useState(null);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const [deleteMode, setDeleteMode] = useState(false);

	const {
		_id,
		assetType,
		amount,
		currency,
		purchaseDate,
		ticker,
		exchange,
		quantity,
		purchasePrice: manualPurchasePrice,
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

	// 현재 가치와 수익률 계산 (과거 주가 기반)
	useEffect(() => {
		const calculateValue = async () => {
			try {
				setLoading(true);
				let currentVal = 0;
				let cost = 0;
				let purchasePriceValue = null;
				let currentPriceValue = null;

				if (assetType === "stock" && ticker) {
					// 주식의 경우 과거 주가와 현재 주가 비교
					const qty = quantity || 0;

					try {
						// 현재 주가 조회
						const currentQuote = await fetchQuote(ticker);
						currentPriceValue =
							currentQuote && currentQuote["05. price"]
								? parseFloat(currentQuote["05. price"])
								: 0;

						// 매입 시기 주가 조회
						const historicalPrice = await fetchHistoricalPrice(
							ticker,
							purchaseDate
						);
						purchasePriceValue = historicalPrice ? historicalPrice.close : 0;

						if (currentPriceValue > 0 && purchasePriceValue > 0 && qty > 0) {
							// 정확한 계산: 보유수량 × 현재가 = 현재가치, 보유수량 × 매입가 = 투자원금
							currentVal = currentPriceValue * qty;
							cost = purchasePriceValue * qty;
						} else {
							// API 호출 실패시 기존 투자금액 사용
							currentVal = amount;
							cost = amount;
						}
					} catch (apiError) {
						console.warn(`API 호출 실패 (${ticker}):`, apiError.message);
						// API 호출 실패시 기존 투자금액 사용
						currentVal = amount;
						cost = amount;
					}
				} else if (assetType === "bond") {
					// 채권의 경우 단순화된 계산
					currentVal = amount * 1.02; // 2% 수익률 가정
					cost = amount;
				} else if (assetType === "fund") {
					// 펀드의 경우 단순화된 계산
					currentVal = amount * 1.05; // 5% 수익률 가정
					cost = amount;
				} else {
					currentVal = amount;
					cost = amount;
				}

				setCurrentValue(currentVal);
				setPurchasePrice(purchasePriceValue);
				setCurrentPrice(currentPriceValue);
				const returnPct = cost > 0 ? ((currentVal - cost) / cost) * 100 : 0;
				setReturnPercent(returnPct);
			} catch (error) {
				console.error(
					`Error calculating value for ${ticker || assetType}:`,
					error
				);
				setCurrentValue(amount);
				setReturnPercent(0);
			} finally {
				setLoading(false);
			}
		};

		calculateValue();
	}, [portfolio]);

	const toggleDeleteMode = (e) => {
		e.stopPropagation();
		setDeleteMode(!deleteMode);
	};

	const cancelDeleteMode = (e) => {
		e.stopPropagation();
		setDeleteMode(false);
	};

	const handleDelete = async (e) => {
		e.stopPropagation();
		setDeleting(true);
		try {
			await deletePortfolio({
				assetType,
				id: _id,
				onSuccess: () => {
					onDelete(_id);
				},
				onError: (msg) => {
					console.error("Delete failed:", msg);
					alert(msg);
				},
			});
		} catch (error) {
			console.error("Delete error:", error);
			alert("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
		} finally {
			setDeleting(false);
			setDeleteMode(false);
		}
	};

	return (
		<div style={cardStyle}>
			{/* 삭제 버튼 */}
			<div style={deleteWrapperStyle}>
				{!deleteMode ? (
					<span
						className="material-icons"
						style={trashIconStyle}
						onClick={toggleDeleteMode}
						title="삭제"
					>
						delete
					</span>
				) : (
					<>
						<button
							style={deleteButtonStyle}
							onClick={handleDelete}
							disabled={deleting}
						>
							{deleting ? "삭제 중..." : "삭제하기"}
						</button>
						<button style={deleteGoBackButtonStyle} onClick={cancelDeleteMode}>
							돌아가기
						</button>
					</>
				)}
			</div>

			<div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#93c5fd" }}>
				{assetType === "stock" && `${ticker || "N/A"}`}
				{assetType === "bond" && `${issuer || "N/A"}`}
				{assetType === "fund" && `${fundName || "N/A"}`}
			</div>
			<div style={fieldRowStyle}>
				<div>
					<span style={labelStyle}>투자원금: </span>
					{!loading && assetType === "stock" && purchasePrice && quantity
						? `${(purchasePrice * quantity).toLocaleString()} ${currency}`
						: `${amount.toLocaleString()} ${currency}`}
				</div>
				<div>
					<span style={labelStyle}>매수일: </span>
					{new Date(purchaseDate).toLocaleDateString()}
				</div>
			</div>

			{/* 수익률 정보 표시 */}
			{!loading && (
				<div style={returnStyle}>
					<div>
						<span style={labelStyle}>현재 가치: </span>
						<span style={{ color: "#f1f5f9", fontWeight: "600" }}>
							{currentValue ? currentValue.toLocaleString() : "-"} {currency}
						</span>
					</div>
					<div>
						<span style={labelStyle}>수익률: </span>
						<span
							style={{
								color: returnPercent >= 0 ? "#10b981" : "#ef4444",
								fontWeight: "700",
								fontSize: "1rem",
							}}
						>
							{returnPercent >= 0 ? "+" : ""}
							{returnPercent.toFixed(1)}%
						</span>
					</div>
				</div>
			)}

			{/* 주식의 경우 매입가와 현재가 표시 */}
			{!loading && assetType === "stock" && purchasePrice && currentPrice && (
				<div style={fieldRowStyle}>
					<div>
						<span style={labelStyle}>매입가: </span>
						<span style={{ color: "#f1f5f9" }}>
							{purchasePrice.toLocaleString()} {currency}
						</span>
					</div>
					<div>
						<span style={labelStyle}>현재가: </span>
						<span
							style={{
								color: currentPrice >= purchasePrice ? "#10b981" : "#ef4444",
								fontWeight: "600",
							}}
						>
							{currentPrice.toLocaleString()} {currency}
						</span>
					</div>
				</div>
			)}

			{loading && (
				<div
					style={{
						textAlign: "center",
						color: "#94a3b8",
						fontSize: "0.9rem",
						padding: "0.5rem",
					}}
				>
					수익률 계산 중...
				</div>
			)}

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
					{!loading && purchasePrice && (
						<div style={fieldRowStyle}>
							<div>
								<span style={labelStyle}>매입일 기준 주가: </span>
								{purchasePrice.toLocaleString()} {currency}
							</div>
						</div>
					)}
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
							<span style={labelStyle}>펀드 종류: </span>
							{fundType === "mutual" ? "뮤추얼펀드" : "ETF"}
						</div>
						<div>
							<span style={labelStyle}>펀드 코드: </span>
							{fundCode || "-"}
						</div>
					</div>
					{/* <div style={fieldRowStyle}>
						<div>
							<span style={labelStyle}>보유 단위: </span>
							{units || "-"}
						</div>
						<div>
							<span style={labelStyle}>단위당 매입가: </span>
							{purchasePricePerUnit
								? purchasePricePerUnit.toLocaleString()
								: "-"}{" "}
							{currency}
						</div>
					</div> */}
				</>
			)}
		</div>
	);
};

const PortfolioList = ({ portfolios, onPortfolioDelete }) => {
	const stocks = portfolios.filter((p) => p.assetType === "stock");
	const bonds = portfolios.filter((p) => p.assetType === "bond");
	const funds = portfolios.filter((p) => p.assetType === "fund");

	const handleDelete = (portfolioId) => {
		onPortfolioDelete(portfolioId);
	};

	return (
		<div style={containerStyle}>
			<div style={columnStyle}>
				<div style={columnHeaderStyle}>주식</div>
				{stocks.length === 0 ? (
					<p style={{ color: "#64748b", textAlign: "center" }}>없음</p>
				) : (
					stocks.map((p, idx) => (
						<PortfolioCard
							key={p._id || idx}
							portfolio={p}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>
			<div style={columnStyle}>
				<div style={columnHeaderStyle}>채권</div>
				{bonds.length === 0 ? (
					<p style={{ color: "#64748b", textAlign: "center" }}>없음</p>
				) : (
					bonds.map((p, idx) => (
						<PortfolioCard
							key={p._id || idx}
							portfolio={p}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>
			<div style={columnStyle}>
				<div style={columnHeaderStyle}>펀드</div>
				{funds.length === 0 ? (
					<p style={{ color: "#64748b", textAlign: "center" }}>없음</p>
				) : (
					funds.map((p, idx) => (
						<PortfolioCard
							key={p._id || idx}
							portfolio={p}
							onDelete={handleDelete}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default PortfolioList;
