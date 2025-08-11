import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { fetchRiskAnalysis, fetchRiskStatus } from "../utils/riskAndRebalance";
import "../styles/aiAssistantPages.css";

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
const ghostBtn = {
	...buttonStyle,
	backgroundColor: "transparent",
	color: "#cbd5e1",
	border: "1px solid #334155",
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
const selectedListItemStyle = { ...listItemStyle, border: "2px solid #6366f1" };

const filterBarStyle = {
	display: "flex",
	gap: 12,
	flexWrap: "wrap",
	alignItems: "center",
	marginTop: 8,
	marginBottom: 12,
};

const inputStyle = {
	borderRadius: 8,
	border: "1px solid #334155",
	background: "#0f172a",
	color: "#e5e7eb",
	padding: "8px 10px",
};

const panelCard = {
	backgroundColor: "#1e293b",
	borderRadius: 12,
	padding: "1.25rem",
	boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};

/* ===== 위험 배지/임계 ===== */
const RISK_THRESHOLD = -1;
const tones = {
	"매우 높음": { bg: "rgba(239,68,68,.2)", border: "#ef4444", fg: "#fecaca" },
	높음: { bg: "rgba(245,158,11,.2)", border: "#f59e0b", fg: "#fde68a" },
	보통: { bg: "rgba(59,130,246,.2)", border: "#3b82f6", fg: "#bfdbfe" },
	낮음: { bg: "rgba(34,197,94,.2)", border: "#22c55e", fg: "#bbf7d0" },
	"정보 부족": { bg: "rgba(148,163,184,.2)", border: "#94a3b8", fg: "#cbd5e1" },
};
const badge = (level) => {
	const t = tones[level] || tones["보통"];
	return {
		display: "inline-block",
		padding: "0.15rem 0.6rem",
		borderRadius: 999,
		fontSize: 12,
		fontWeight: 800,
		color: t.fg,
		background: t.bg,
		border: `1px solid ${t.border}`,
		whiteSpace: "nowrap",
	};
};

/* ===== 제안 로직 (우측 패널용) ===== */
const getSuggestion = (risk_score = 0, risk_level) => {
	if (risk_level === "정보 부족")
		return { action: "유지(정보 보강 전)", delta: 0 };
	if (risk_score <= -5) return { action: "강한 축소", delta: -30 };
	if (risk_score <= -3) return { action: "축소", delta: -20 };
	if (risk_score <= -1) return { action: "소폭 축소", delta: -10 };
	if (risk_score >= 4) return { action: "소폭 확대", delta: +5 };
	return { action: "유지", delta: 0 };
};

const RiskAndRebalance = () => {
	// 왼쪽 패널 상태 (상세 리포트용)
	const [items, setItems] = useState([]); // [{stock,ticker,risk_score,risk_level,report,top_news_links}]
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [requested, setRequested] = useState(false);
	const [selectedId, setSelectedId] = useState(null);
	const [query, setQuery] = useState("");
	const [onlyRisk, setOnlyRisk] = useState(false);
	const [includeInfoLack, setIncludeInfoLack] = useState(true);
	const [sortKey, setSortKey] = useState("risk_score");

	// 오른쪽 패널 상태 (리밸런싱 제안용)
	const [rebalanceItems, setRebalanceItems] = useState([]); // [{ticker,company_name,risk_score,...}]
	const [rebalanceLoading, setRebalanceLoading] = useState(false);
	const [rebalanceError, setRebalanceError] = useState(null);
	const [rebalanceReady, setRebalanceReady] = useState(false);

	/* ===== API 호출 (왼쪽 "분석 시작하기" 버튼) ===== */
	const load = async () => {
		setRequested(true);
		setLoading(true);
		setError(null);
		setRebalanceReady(false); // 왼쪽 분석 새로하면 오른쪽 제안은 초기화
		setRebalanceItems([]);
		setRebalanceError(null);
		try {
			const data = await fetchRiskAnalysis();
			setItems(data || []);
			setSelectedId(data?.length ? data[0].ticker || data[0].stock : null);
		} catch (e) {
			setError(e.message || "API 호출 실패");
		} finally {
			setLoading(false);
		}
	};

	/* ===== API 호출 (오른쪽 "제안 생성하기" 버튼) ===== */
	const handleGenerateSuggestion = async () => {
		setRebalanceLoading(true);
		setRebalanceError(null);
		try {
			const data = await fetchRiskStatus();
			setRebalanceItems(data.statuses || []);
			setRebalanceReady(true);
		} catch (e) {
			setRebalanceError(e.message || "리밸런싱 제안 생성에 실패했습니다.");
			setRebalanceReady(false);
		} finally {
			setRebalanceLoading(false);
		}
	};

	/* ===== 좌측: 필터링/정렬 ===== */
	const filtered = useMemo(() => {
		let arr = (items || []).slice();
		if (query.trim()) {
			const s = query.toLowerCase();
			arr = arr.filter(
				(r) =>
					String(r.ticker || "")
						.toLowerCase()
						.includes(s) ||
					String(r.stock || "")
						.toLowerCase()
						.includes(s)
			);
		}
		if (onlyRisk)
			arr = arr.filter((r) => (r.risk_score ?? 0) <= RISK_THRESHOLD);
		if (!includeInfoLack) arr = arr.filter((r) => r.risk_level !== "정보 부족");

		switch (sortKey) {
			case "ticker":
				arr.sort((a, b) => (a.ticker || "").localeCompare(b.ticker || ""));
				break;
			case "stock":
				arr.sort((a, b) => (a.stock || "").localeCompare(b.stock || ""));
				break;
			default:
				arr.sort((a, b) => (a.risk_score ?? 0) - (b.risk_score ?? 0));
		}
		return arr;
	}, [items, query, onlyRisk, includeInfoLack, sortKey]);

	const selected = filtered.find((r) => (r.ticker || r.stock) === selectedId);

	/* ===== 우측: 리밸런싱 표 생성 ===== */
	const rebalanceRows = useMemo(() => {
		if (!rebalanceReady) return [];
		return (rebalanceItems || []).map((r) => {
			const { action, delta } = getSuggestion(r.risk_score, r.risk_level);
			return {
				key: r.ticker,
				stock: r.company_name, // API 응답에 맞춰 company_name 사용
				ticker: r.ticker,
				risk_level: r.risk_level,
				risk_score: Number(r.risk_score ?? 0),
				is_risk: r.is_risk,
				action,
				delta,
			};
		});
	}, [rebalanceReady, rebalanceItems]);

	return (
		<div className="page">
			{/* back button */}
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
				onClick={() => (window.location.href = "/?tab=assistant")}
				title="뒤로가기"
			>
				arrow_back
			</span>

			<div className="container">
				<div className="header-wrapper">
					<h1 className="header-title">위험신호 감지 및 리밸런싱</h1>
				</div>

				<section
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
						gap: 16,
						alignItems: "start",
						marginBottom: 24,
					}}
				>
					{/* === 왼쪽: 리스크 분석 리포트 생성하기 === */}
					<div style={panelCard}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 10,
							}}
						>
							<div style={{ fontWeight: 700, color: "#a5b4fc" }}>
								리스크 분석 리포트 생성하기
							</div>
							<button style={buttonStyle} onClick={load} disabled={loading}>
								{loading
									? "생성 중..."
									: requested
									? "다시 분석"
									: "분석 시작하기"}
								{loading && <div style={spinnerStyle} />}
							</button>
						</div>

						<div style={filterBarStyle}>
							<select
								style={{ ...inputStyle }}
								value={sortKey}
								onChange={(e) => setSortKey(e.target.value)}
								disabled={!requested}
							>
								<option value="risk_score">위험도(오름차순)</option>
								<option value="ticker">Ticker</option>
								<option value="stock">회사명</option>
							</select>
						</div>

						{!requested && !loading && (
							<div style={{ color: "#cbd5e1", marginTop: 12 }}>
								우측 상단 버튼으로 분석을 실행하세요. <br />
								1~5분 정도 소요됩니다.
							</div>
						)}
						{requested && items.length === 0 && !loading && (
							<div>표시할 종목이 없습니다.</div>
						)}
						{error && <div style={{ color: "red" }}>{error}</div>}

						<div>
							{filtered.map((r) => {
								const key = r.ticker || r.stock;
								const isSel = key === selectedId;
								const isRisk = (r.risk_score ?? 0) <= RISK_THRESHOLD;
								return (
									<div
										key={key}
										style={isSel ? selectedListItemStyle : listItemStyle}
										onClick={() => setSelectedId(key)}
										title={`${r.stock || "-"} (${r.ticker || "-"})`}
									>
										<div>
											<div style={{ fontWeight: 700, color: "#f1f5f9" }}>
												{r.stock || "-"}{" "}
												<span style={{ color: "#cbd5e1" }}>
													({r.ticker || "-"})
												</span>
											</div>
											<div style={{ color: "#cbd5e1", marginTop: 4 }}>
												risk_score:{" "}
												<b style={{ color: isRisk ? "#fca5a5" : "#a7f3d0" }}>
													{Number(r.risk_score ?? 0).toFixed(2)}
												</b>
											</div>
										</div>
										<div style={badge(r.risk_level)}>{r.risk_level}</div>
									</div>
								);
							})}
							{loading && (
								<div
									style={{
										textAlign: "center",
										marginTop: 12,
										color: "#c4b5fd",
									}}
								>
									<div
										style={{
											...spinnerStyle,
											width: 30,
											height: 30,
											margin: "0 auto",
										}}
									/>
									<div style={{ marginTop: 10 }}>분석 결과 불러오는 중...</div>
								</div>
							)}
						</div>

						{/* 상세 */}
						{requested && filtered.length > 0 && !loading && selected && (
							<div style={{ marginTop: 24 }}>
								<div
									style={{ fontWeight: 600, color: "#93c5fd", marginBottom: 8 }}
								>
									선택된 종목: <strong>{selected.stock}</strong> (
									{selected.ticker}) | 위험도:{" "}
									<span style={badge(selected.risk_level)}>
										{selected.risk_level}
									</span>{" "}
									| 점수: <b>{Number(selected.risk_score ?? 0).toFixed(2)}</b>
								</div>
								<section
									style={{
										backgroundColor: "#111827",
										borderRadius: 12,
										padding: "1rem",
										color: "#e0e0e0",
										maxHeight: 420,
										overflowY: "auto",
										whiteSpace: "pre-wrap",
										fontSize: 14,
										lineHeight: 1.6,
										fontFamily: "'Noto Sans KR', sans-serif",
										marginBottom: "1.0rem",
									}}
								>
									<ReactMarkdown>
										{selected.report || "(리포트 본문 없음)"}
									</ReactMarkdown>
								</section>
								{selected.top_news_links &&
									selected.top_news_links.length > 0 && (
										<section>
											{top_news_links.map((top_news_link) => (
												<div key={top_news_link.uri}>
													<a href={top_news_link.uri}>{top_news_link.title}</a>
												</div>
											))}
										</section>
									)}
							</div>
						)}
					</div>

					{/* === 오른쪽: 리스크 리밸런싱하기 === */}
					<div style={panelCard}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: 10,
							}}
						>
							<div style={{ fontWeight: 700, color: "#a5b4fc" }}>
								리스크 리밸런싱하기
							</div>
							<button
								style={buttonStyle}
								onClick={handleGenerateSuggestion}
								disabled={rebalanceLoading}
							>
								{rebalanceLoading ? "생성 중..." : "제안 생성하기"}
								{rebalanceLoading && <div style={spinnerStyle} />}
							</button>
						</div>

						{rebalanceLoading && (
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
								<div style={{ marginTop: 10 }}>제안 생성 중...</div>
							</div>
						)}

						{rebalanceError && (
							<div style={{ color: "#ef4444", marginTop: 12 }}>
								오류: {rebalanceError}
							</div>
						)}

						{!rebalanceLoading && !rebalanceError && rebalanceReady && (
							<>
								<div
									style={{
										color: "#93c5fd",
										fontWeight: 600,
										marginTop: 6,
										marginBottom: 8,
									}}
								>
									제안 목록 ({rebalanceItems.length}건 기준)
								</div>
								<div
									style={{
										overflowX: "auto",
										border: "1px solid #314256",
										borderRadius: 8,
									}}
								>
									<table style={{ width: "100%", borderCollapse: "collapse" }}>
										<thead>
											<tr>
												{[
													"티커",
													"회사",
													"위험도",
													"점수",
													"액션",
													"권장 변경(%)",
												].map((h) => (
													<th
														key={h}
														style={{
															textAlign: "left",
															padding: "10px 12px",
															background: "#0b1222",
															color: "#93c5fd",
															borderBottom: "1px solid #314256",
															whiteSpace: "nowrap",
														}}
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{rebalanceRows.map((r) => {
												const riskRowStyle = {
													backgroundColor: "rgba(239, 68, 68, 0.2)",
												};

												return (
													<tr key={r.key} style={r.is_risk ? riskRowStyle : {}}>
														<td style={tdStyle}>{r.ticker || "-"}</td>
														<td style={tdStyle}>{r.stock || "-"}</td>
														<td style={{ ...tdStyle }}>{r.risk_level}</td>
														<td style={tdStyle}>{r.risk_score}</td>
														<td style={tdStyle}>{r.action}</td>
														<td style={{ ...tdStyle, fontWeight: 800 }}>
															{r.delta > 0 ? `+${r.delta}` : r.delta}
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
								<div style={{ color: "#94a3b8", marginTop: 8, fontSize: 12 }}>
									* 단순 규칙 기반 제안입니다. 실제 비중 변경 전 추가 검토를
									권장합니다.
								</div>
							</>
						)}

						{!rebalanceLoading && !rebalanceReady && !rebalanceError && (
							<div style={{ color: "#cbd5e1", marginTop: 12 }}>
								우측 상단 버튼으로 리밸런싱 제안을 받아보세요. <br />
								1~5분 정도 소요됩니다.
							</div>
						)}
					</div>
				</section>
			</div>

			<style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.08); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.7); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(229, 231, 235, 0.9); }
        * { scrollbar-width: thin; scrollbar-color: rgba(156,163,175,0.7) rgba(255,255,255,0.08); }
      `}</style>
		</div>
	);
};

const tdStyle = {
	padding: "10px 12px",
	borderBottom: "1px solid #314256",
	color: "#e5e7eb",
	verticalAlign: "top",
};

export default RiskAndRebalance;
