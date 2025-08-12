import React, { useState } from "react";
import { addPortfolio } from "../utils/portfolio";

const containerStyle = {
	background: "linear-gradient(to bottom, #1e293b, #0f172a)",
	minHeight: "100vh",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	fontFamily: "'Inter', sans-serif",
	padding: "2rem",
	position: "relative",
};

const backIconStyle = {
	position: "absolute",
	top: "1.5rem",
	left: "1.5rem",
	cursor: "pointer",
	fontSize: "2rem",
	color: "#f8fafc",
	zIndex: 10,
};

const formWrapperStyle = {
	backgroundColor: "rgba(255, 255, 255, 0.03)",
	padding: "2.5rem",
	borderRadius: "1rem",
	boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
	width: "100%",
	maxWidth: "420px",
	border: "1px solid rgba(255,255,255,0.07)",
	color: "#f1f5f9",
};

const titleStyle = {
	textAlign: "center",
	fontSize: "1.7rem",
	fontWeight: "700",
	marginBottom: "2rem",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "0.5rem",
	color: "#e2e8f0",
};

const formStyle = {
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
};

const labelStyle = {
	fontWeight: "600",
};

const inputStyle = {
	padding: "0.85rem 1rem",
	borderRadius: "0.5rem",
	border: "1px solid #334155",
	backgroundColor: "#0f172a",
	color: "#f1f5f9",
	fontSize: "1rem",
	fontFamily: "'Inter', sans-serif",
};

const buttonStyle = {
	background: "linear-gradient(to right, #6366f1, #3b82f6)",
	border: "none",
	borderRadius: "0.5rem",
	padding: "0.8rem",
	color: "white",
	fontSize: "1.05rem",
	cursor: "pointer",
	fontWeight: "600",
	boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
	marginTop: "1rem",
};

const infoTextStyle = {
	fontSize: "0.85rem",
	color: "#94a3b8",
	fontStyle: "italic",
	marginTop: "0.25rem",
};

const AddPortfolio = () => {
	const [assetType, setAssetType] = useState("stock");
	const [formData, setFormData] = useState({
		amount: "",
		currency: "KRW",
		purchaseDate: "",
		ticker: "",
		exchange: "",
		quantity: "",
		issuer: "",
		maturityDate: "",
		faceValue: "",
		couponRate: "",
		interestPaymentFreq: "annual",
		fundName: "",
		fundType: "mutual",
		fundCode: "",
		units: "",
		purchasePricePerUnit: "",
	});

	const handleBack = () => {
		window.location.href = "/?tab=portfolio";
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// 주식의 경우 매입일 기준 주가로 투자금액 계산
		let calculatedAmount = 0;
		if (assetType === "stock" && formData.ticker && formData.purchaseDate && formData.quantity) {
			try {
				// 매입 시기 주가 조회하여 투자금액 계산
				const { fetchHistoricalPrice } = await import("../utils/alphavantage");
				const historicalPrice = await fetchHistoricalPrice(formData.ticker, formData.purchaseDate);
				if (historicalPrice && historicalPrice.close) {
					calculatedAmount = historicalPrice.close * Number(formData.quantity);
				} else {
					alert("매입일 기준 주가를 조회할 수 없습니다. 다시 시도해주세요.");
					return;
				}
			} catch (error) {
				console.error("Error calculating amount from historical price:", error);
				alert("매입일 기준 주가 조회 중 오류가 발생했습니다. 다시 시도해주세요.");
				return;
			}
		} else if (assetType === "bond" || assetType === "fund") {
			// 채권과 펀드는 입력된 투자금액 사용
			calculatedAmount = Number(formData.amount);
			if (!calculatedAmount || calculatedAmount <= 0) {
				alert("투자금액을 입력해주세요.");
				return;
			}
		}

		// Prepare data with correct types (e.g., convert dates and numbers)
		const payload = {
			assetType,
			amount: calculatedAmount,
			currency: formData.currency,
			purchaseDate: formData.purchaseDate,
			// stock
			ticker: formData.ticker || undefined,
			exchange: formData.exchange || undefined,
			quantity: formData.quantity ? Number(formData.quantity) : undefined,
			// bond
			issuer: formData.issuer || undefined,
			maturityDate: formData.maturityDate || undefined,
			faceValue: formData.faceValue ? Number(formData.faceValue) : undefined,
			couponRate: formData.couponRate ? Number(formData.couponRate) : undefined,
			interestPaymentFreq: formData.interestPaymentFreq,
			// fund
			fundName: formData.fundName || undefined,
			fundType: formData.fundType,
			fundCode: formData.fundCode || undefined,
			units: formData.units ? Number(formData.units) : undefined,
			purchasePricePerUnit: formData.purchasePricePerUnit
				? Number(formData.purchasePricePerUnit)
				: undefined,
		};

		addPortfolio({
			form: payload,
			onSuccess: () => {
				alert("포트폴리오가 저장되었습니다.");
				window.location.href = "/?tab=portfolio";
			},
			onError: (msg) => {
				alert(msg);
			},
		});
	};

	return (
		<div style={containerStyle}>
			<span
				className="material-icons"
				style={backIconStyle}
				onClick={handleBack}
				aria-label="뒤로가기"
			>
				arrow_back
			</span>

			<div style={formWrapperStyle}>
				<h1 style={titleStyle}>
					<span className="material-icons" style={{ fontSize: "2rem" }}>
						playlist_add
					</span>
					포트폴리오 항목 추가하기
				</h1>

				<form style={formStyle} onSubmit={handleSubmit}>
					<label style={labelStyle}>자산 종류</label>
					<select
						name="assetType"
						value={assetType}
						onChange={(e) => setAssetType(e.target.value)}
						style={inputStyle}
					>
						<option value="stock">주식</option>
						<option value="bond">채권</option>
						<option value="fund">펀드</option>
					</select>

					<label style={labelStyle}>통화</label>
					<input
						type="text"
						name="currency"
						value={formData.currency}
						onChange={handleChange}
						style={inputStyle}
						required
					/>

					<label style={labelStyle}>매수일</label>
					<input
						type="date"
						name="purchaseDate"
						value={formData.purchaseDate}
						onChange={handleChange}
						style={inputStyle}
						required
					/>

					{assetType === "stock" && (
						<>
							<label style={labelStyle}>종목 코드 (Ticker)</label>
							<input
								type="text"
								name="ticker"
								value={formData.ticker}
								onChange={handleChange}
								style={inputStyle}
								required
							/>
							<label style={labelStyle}>거래소</label>
							<input
								type="text"
								name="exchange"
								value={formData.exchange}
								onChange={handleChange}
								style={inputStyle}
							/>
							<label style={labelStyle}>보유 수량</label>
							<input
								type="number"
								name="quantity"
								value={formData.quantity}
								onChange={handleChange}
								style={inputStyle}
								required
							/>
							<div style={infoTextStyle}>
								💡 매입일 기준 과거 주가를 자동으로 조회하여 정확한 투자금액과 수익률을 계산합니다.
							</div>
						</>
					)}

					{assetType === "bond" && (
						<>
							<label style={labelStyle}>투자금액</label>
							<input
								type="number"
								name="amount"
								value={formData.amount || ""}
								onChange={handleChange}
								style={inputStyle}
								required
							/>
							<label style={labelStyle}>발행기관</label>
							<input
								type="text"
								name="issuer"
								value={formData.issuer}
								onChange={handleChange}
								style={inputStyle}
								required
							/>
							<label style={labelStyle}>만기일</label>
							<input
								type="date"
								name="maturityDate"
								value={formData.maturityDate}
								onChange={handleChange}
								style={inputStyle}
							/>
							<label style={labelStyle}>액면가</label>
							<input
								type="number"
								name="faceValue"
								value={formData.faceValue}
								onChange={handleChange}
								style={inputStyle}
							/>
							<label style={labelStyle}>쿠폰 이자율 (%)</label>
							<input
								type="number"
								step="0.01"
								name="couponRate"
								value={formData.couponRate}
								onChange={handleChange}
								style={inputStyle}
							/>
							<label style={labelStyle}>이자 지급 주기</label>
							<select
								name="interestPaymentFreq"
								value={formData.interestPaymentFreq}
								onChange={handleChange}
								style={inputStyle}
							>
								<option value="annual">annual</option>
								<option value="semiannual">semiannual</option>
								<option value="quarterly">quarterly</option>
							</select>
						</>
					)}

					{assetType === "fund" && (
						<>
							<label style={labelStyle}>투자금액</label>
							<input
								type="number"
								name="amount"
								value={formData.amount || ""}
								onChange={handleChange}
								style={inputStyle}
								required
							/>
							<label style={labelStyle}>펀드명</label>
							<input
								type="text"
								name="fundName"
								value={formData.fundName}
								onChange={handleChange}
								style={inputStyle}
								required
							/>
							<label style={labelStyle}>펀드 유형</label>
							<select
								name="fundType"
								value={formData.fundType}
								onChange={handleChange}
								style={inputStyle}
							>
								<option value="mutual">mutual</option>
								<option value="etf">etf</option>
							</select>
							<label style={labelStyle}>펀드 코드</label>
							<input
								type="text"
								name="fundCode"
								value={formData.fundCode}
								onChange={handleChange}
								style={inputStyle}
							/>
							{/* <label style={labelStyle}>보유 단위</label>
							<input
								type="number"
								name="units"
								value={formData.units}
								onChange={handleChange}
								style={inputStyle}
							/>
							<label style={labelStyle}>단위당 매입가</label>
							<input
								type="number"
								name="purchasePricePerUnit"
								value={formData.purchasePricePerUnit}
								onChange={handleChange}
								style={inputStyle}
							/> */}
						</>
					)}

					<button type="submit" style={buttonStyle}>
						저장하기
					</button>
				</form>
			</div>
		</div>
	);
};

export default AddPortfolio;
