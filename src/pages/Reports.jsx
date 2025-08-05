import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
	fetchCreateReport,
	fetchReportsList,
	deleteReport as apiDeleteReport,
} from "../utils/report";

const appBackgroundStyle = {
	minHeight: "100vh",
	backgroundColor: "#0f172a",
	color: "#f8fafc",
	fontFamily: "'Inter', sans-serif",
	padding: "2rem",
	boxSizing: "border-box",
	position: "relative",
};

const containerStyle = {
	maxWidth: 960,
	margin: "0 auto",
	borderRadius: 16,
	padding: "2rem 3rem",
	boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
	backgroundColor: "#0f172a",
};

const headerWrapperStyle = {
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	marginBottom: 24,
};

const headerStyle = {
	fontWeight: "700",
	fontSize: "1.8rem",
};

const buttonStyle = {
	padding: "0.5rem 1.2rem",
	borderRadius: 8,
	backgroundColor: "#7c3aed",
	color: "#fff",
	border: "none",
	cursor: "pointer",
	fontWeight: "600",
	display: "flex",
	alignItems: "center",
	gap: 6,
};

const spinnerStyle = {
	width: 20,
	height: 20,
	border: "3px solid #c4b5fd",
	borderTopColor: "transparent",
	borderRadius: "50%",
	animation: "spin 1s linear infinite",
};

const labelStyle = {
	fontWeight: "600",
	color: "#a5b4fc",
	marginBottom: "0.5rem",
};

const listItemStyle = {
	backgroundColor: "#273549",
	borderRadius: 10,
	padding: "1rem",
	marginBottom: "1rem",
	cursor: "pointer",
	boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
};

const selectedListItemStyle = {
	...listItemStyle,
	border: "2px solid #6366f1",
};

const trashIconStyle = {
	cursor: "pointer",
	fontSize: "1.5rem",
	color: "#f87171",
	marginLeft: 12,
};

const deleteButtonStyle = {
	padding: "0.3rem 0.8rem",
	borderRadius: 6,
	backgroundColor: "#ef4444",
	color: "white",
	border: "none",
	cursor: "pointer",
	fontWeight: "600",
	marginLeft: 12,
};

const deleteGoBackButtonStyle = {
	padding: "0.3rem 0.8rem",
	borderRadius: 6,
	backgroundColor: "#4ade80",
	color: "white",
	border: "none",
	cursor: "pointer",
	fontWeight: "600",
	marginLeft: 8,
};

const Reports = () => {
	const [reports, setReports] = useState([]);
	const [selectedReportId, setSelectedReportId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [deleteMode, setDeleteMode] = useState({});

	useEffect(() => {
		const loadReports = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchReportsList();
				const reportsArray = data?.reports_list || [];
				setReports(reportsArray);
				if (reportsArray.length > 0)
					setSelectedReportId(reportsArray[0].report_id);
			} catch (err) {
				setError(err.message || "API 호출 실패");
			} finally {
				setLoading(false);
			}
		};
		loadReports();
	}, []);

	const createNewReport = async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await fetchCreateReport();
			setReports((prev) => [...prev, data]);
			setSelectedReportId(data.report_id);
		} catch (err) {
			setError(err.message || "API 호출 실패");
		} finally {
			setLoading(false);
		}
	};

	const selectedReport = reports.find((r) => r.report_id === selectedReportId);

	const toggleDeleteMode = (reportId, e) => {
		e.stopPropagation();
		setDeleteMode((prev) => ({
			...prev,
			[reportId]: !prev[reportId],
		}));
	};

	const cancelDeleteMode = (reportId, e) => {
		e.stopPropagation();
		setDeleteMode((prev) => {
			const copy = { ...prev };
			delete copy[reportId];
			return copy;
		});
	};

	const deleteReport = async (reportId) => {
		setLoading(true);
		setError(null);
		try {
			const res = await apiDeleteReport(reportId);
			if (res.success) {
				setReports((prev) => prev.filter((r) => r.report_id !== reportId));
				setDeleteMode((prev) => {
					const copy = { ...prev };
					delete copy[reportId];
					return copy;
				});
				if (selectedReportId === reportId) {
					setSelectedReportId(null);
				}
			} else {
				setError("삭제 실패: 서버에서 실패 응답을 받았습니다.");
			}
		} catch (err) {
			setError(err.message || "삭제 실패");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={appBackgroundStyle}>
			<span
				className="material-icons"
				style={{
					position: "absolute",
					top: "1.5rem",
					left: "1.5rem",
					cursor: "pointer",
					fontSize: "2rem",
					color: "#f8fafc",
					zIndex: 100,
				}}
				onClick={() => {
					window.location.href = "/?tab=assistant";
				}}
				title="뒤로가기"
			>
				arrow_back
			</span>
			<div style={containerStyle}>
				<div style={headerWrapperStyle}>
					<h1 style={headerStyle}>자동 리포트 생성</h1>
					<button
						style={buttonStyle}
						onClick={createNewReport}
						disabled={loading}
					>
						+ 새 리포트 생성하기
						{loading && <div style={spinnerStyle} />}
					</button>
				</div>

				<section style={{ marginBottom: 24 }}>
					<div style={labelStyle}>나의 리포트 목록</div>
					{reports.length === 0 && !loading && (
						<div>생성된 리포트가 없습니다.</div>
					)}
					{error && <div style={{ color: "red" }}>{error}</div>}
					<div>
						{reports.map((r) => (
							<div
								key={r.report_id}
								style={
									r.report_id === selectedReportId
										? selectedListItemStyle
										: listItemStyle
								}
								onClick={() => setSelectedReportId(r.report_id)}
							>
								<div>
									<div>
										<strong>리포트 ID:</strong> {r.report_id}
									</div>
									<div>
										<small>{new Date(r.generated_at).toLocaleString()}</small>
									</div>
								</div>
								<div>
									{!deleteMode[r.report_id] ? (
										<span
											className="material-icons"
											style={trashIconStyle}
											onClick={(e) => toggleDeleteMode(r.report_id, e)}
											title="삭제"
										>
											delete
										</span>
									) : (
										<>
											<button
												style={deleteButtonStyle}
												onClick={(e) => {
													e.stopPropagation();
													deleteReport(r.report_id);
												}}
											>
												삭제하기
											</button>
											<button
												style={deleteGoBackButtonStyle}
												onClick={(e) => cancelDeleteMode(r.report_id, e)}
											>
												돌아가기
											</button>
										</>
									)}
								</div>
							</div>
						))}
						{loading && (
							<div
								style={{ textAlign: "center", marginTop: 12, color: "#c4b5fd" }}
							>
								<div
									style={{
										...spinnerStyle,
										width: 30,
										height: 30,
										margin: "0 auto",
									}}
								/>
								<div style={{ marginTop: "10px" }}>리포트 생성 중...</div>
							</div>
						)}
					</div>
				</section>

				{selectedReport && !loading && (
					<div style={{ marginTop: "80px" }}>
						<div
							style={{ fontWeight: "600", color: "#93c5fd", marginBottom: 8 }}
						>
							선택된 리포트 ID: <strong>{selectedReport.report_id}</strong> |
							생성 시각:{" "}
							{new Date(selectedReport.generated_at).toLocaleString()}
						</div>

						<section
							style={{
								backgroundColor: "#1e293b",
								borderRadius: 12,
								padding: "1.5rem 2rem",
								marginBottom: "1.5rem",
								boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
							}}
						>
							<div
								style={{
									fontWeight: "600",
									color: "#a5b4fc",
									marginBottom: "0.5rem",
								}}
							>
								포트폴리오 요약
							</div>
							<div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
								<div>
									<div
										style={{
											fontSize: 18,
											fontWeight: "700",
											color: "#f1f5f9",
										}}
									>
										{selectedReport.portfolio_summary.total_assets}
									</div>
									<div>총 자산 수</div>
								</div>
								<div>
									<div
										style={{
											fontSize: 18,
											fontWeight: "700",
											color: "#f1f5f9",
										}}
									>
										주식: {selectedReport.portfolio_summary.asset_types.stock}
									</div>
									<div>주식 자산 개수</div>
								</div>
								<div>
									<div
										style={{
											fontSize: 18,
											fontWeight: "700",
											color: "#f1f5f9",
										}}
									>
										채권: {selectedReport.portfolio_summary.asset_types.bond}
									</div>
									<div>채권 자산 개수</div>
								</div>
								<div>
									<div
										style={{
											fontSize: 18,
											fontWeight: "700",
											color: "#f1f5f9",
										}}
									>
										다양성 점수:{" "}
										{(
											selectedReport.portfolio_summary.diversification_score *
											100
										).toFixed(1)}
										%
									</div>
									<div>
										자산 다양화{" "}
										{selectedReport.portfolio_summary.is_diversified ? (
											<span
												style={{
													display: "inline-block",
													backgroundColor: "#4ade80",
													color: "#064e3b",
													padding: "0.15rem 0.5rem",
													borderRadius: 8,
													fontWeight: "600",
													fontSize: 12,
													marginLeft: 8,
												}}
											>
												좋음
											</span>
										) : (
											<span
												style={{
													display: "inline-block",
													backgroundColor: "#f87171",
													color: "#7f1d1d",
													padding: "0.15rem 0.5rem",
													borderRadius: 8,
													fontWeight: "600",
													fontSize: 12,
													marginLeft: 8,
												}}
											>
												낮음
											</span>
										)}
									</div>
								</div>
							</div>
						</section>

						<section
							style={{
								backgroundColor: "#111827",
								borderRadius: 12,
								padding: "1rem",
								color: "#e0e0e0",
								maxHeight: 400,
								overflowY: "auto",
								whiteSpace: "pre-wrap",
								fontSize: 14,
								lineHeight: 1.6,
								fontFamily: "'Noto Sans KR', sans-serif",
								marginBottom: "1.5rem",
							}}
						>
							<ReactMarkdown>{selectedReport.report_content}</ReactMarkdown>
						</section>

						{selectedReport.risk_factors &&
							selectedReport.risk_factors.length > 0 && (
								<section
									style={{
										backgroundColor: "#1e293b",
										borderRadius: 12,
										padding: "1.5rem 2rem",
										marginBottom: "1.5rem",
										boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
									}}
								>
									<div
										style={{
											fontWeight: "600",
											color: "#a5b4fc",
											marginBottom: "0.5rem",
										}}
									>
										주요 리스크 요인
									</div>
									<ul style={{ color: "#f87171", fontWeight: "600" }}>
										{selectedReport.risk_factors.map((risk, idx) => (
											<li key={idx}>{risk}</li>
										))}
									</ul>
								</section>
							)}

						{selectedReport.recommendations &&
							selectedReport.recommendations.length > 0 && (
								<section
									style={{
										backgroundColor: "#1e293b",
										borderRadius: 12,
										padding: "1.5rem 2rem",
										marginBottom: "1.5rem",
										boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
									}}
								>
									<div
										style={{
											fontWeight: "600",
											color: "#a5b4fc",
											marginBottom: "0.5rem",
										}}
									>
										추천 사항
									</div>
									<ul style={{ color: "#4ade80", fontWeight: "600" }}>
										{selectedReport.recommendations.map((rec, idx) => (
											<li key={idx}>{rec}</li>
										))}
									</ul>
								</section>
							)}
					</div>
				)}
			</div>

			<style>
				{`
          @keyframes spin {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(360deg);}
          }
        `}
			</style>
		</div>
	);
};

export default Reports;
