import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { fetchRiskAnalysis } from "../utils/riskAndRebalance";
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

const RiskAndRebalance = () => {
	const [items, setItems] = useState([]); // [{stock,ticker,risk_score,risk_level,report,top_news_links}]
	const [selectedId, setSelectedId] = useState(null); // ticker 기준
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [requested, setRequested] = useState(false); // ← 최초 진입 시 자동 호출 방지/상태 표시

	const [query, setQuery] = useState("");
	const [onlyRisk, setOnlyRisk] = useState(false);
	const [includeInfoLack, setIncludeInfoLack] = useState(true);
	const [sortKey, setSortKey] = useState("risk_score"); // risk_score|ticker|stock

	const load = async () => {
		setRequested(true); // ← 버튼 눌렀을 때만 요청 플래그 ON
		setLoading(true);
		setError(null);
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

	// 간단 리밸런싱 제안
	const suggestion = useMemo(() => {
		if (!selected) return "";
		const { risk_score = 0, risk_level } = selected;
		if (risk_level === "정보 부족")
			return "정보 확보 전까지 비중 유지(또는 소폭 축소).";
		if (risk_score <= -5) return "강한 축소: 비중 30%↓ + 대체 종목 분산.";
		if (risk_score <= -3) return "축소: 비중 20%↓.";
		if (risk_score <= -1) return "소폭 축소: 비중 10%↓.";
		return "유지 (또는 소폭 확대 검토).";
	}, [selected]);

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
					<button style={buttonStyle} onClick={load} disabled={loading}>
						{requested ? "로딩 중" : "분석 시작하기"}
						{loading && <div style={spinnerStyle} />}
					</button>
				</div>

				{/* 좌측 목록 */}
				<section style={{ marginBottom: 24 }}>
					<div style={labelStyle}>종목 목록</div>

					<div style={filterBarStyle}>
						<input
							style={{ ...inputStyle, minWidth: 240 }}
							placeholder="티커/회사명 검색 (예: NVDA, 엔비디아)"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							disabled={!requested} // 데이터 로드 전에는 비활성화(선택)
						/>
						<label style={{ color: "#e5e7eb" }}>
							<input
								type="checkbox"
								style={{ marginRight: 6 }}
								checked={onlyRisk}
								onChange={(e) => setOnlyRisk(e.target.checked)}
								disabled={!requested}
							/>
							위험만 보기 (score ≤ {RISK_THRESHOLD})
						</label>
						<label style={{ color: "#e5e7eb" }}>
							<input
								type="checkbox"
								style={{ marginRight: 6 }}
								checked={includeInfoLack}
								onChange={(e) => setIncludeInfoLack(e.target.checked)}
								disabled={!requested}
							/>
							‘정보 부족’ 포함
						</label>
						<select
							style={{ ...inputStyle }}
							value={sortKey}
							onChange={(e) => setSortKey(e.target.value)}
							disabled={!requested}
						>
							<option value="risk_score">위험도(오름차순)</option>
							<option value="ticker">티커</option>
							<option value="stock">회사명</option>
						</select>
					</div>

					{!requested && !loading && (
						<div style={{ color: "#cbd5e1", marginTop: 24 }}>
							아직 불러온 데이터가 없습니다. 우측 상단 버튼으로 분석을
							실행하세요.
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
								style={{ textAlign: "center", marginTop: 25, color: "#c4b5fd" }}
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
				</section>

				{/* 상세 */}
				{requested && selected && !loading && (
					<div style={{ marginTop: 60 }}>
						<div style={{ fontWeight: 600, color: "#93c5fd", marginBottom: 8 }}>
							선택된 종목: <strong>{selected.stock}</strong> ({selected.ticker})
							| 위험도:{" "}
							<span style={badge(selected.risk_level)}>
								{selected.risk_level}
							</span>{" "}
							| 점수: <b>{Number(selected.risk_score ?? 0).toFixed(2)}</b>
						</div>

						{/* 리밸런싱 제안 */}
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
									fontWeight: 600,
									color: "#a5b4fc",
									marginBottom: "0.5rem",
								}}
							>
								리밸런싱 제안
							</div>
							<div style={{ color: "#f8fafc", fontWeight: 600 }}>
								{/* suggestion 텍스트 */}
							</div>
						</section>

						{/* 리포트 */}
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
								marginBottom: "1.5rem",
							}}
						>
							<ReactMarkdown>
								{selected.report || "(리포트 본문 없음)"}
							</ReactMarkdown>
						</section>

						{/* 뉴스 */}
						{selected.top_news_links && selected.top_news_links.length > 0 && (
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
										fontWeight: 600,
										color: "#a5b4fc",
										marginBottom: "0.5rem",
									}}
								>
									관련 뉴스
								</div>
								<ul style={{ color: "#93c5fd", fontWeight: 600 }}>
									{selected.top_news_links.map((n, i) => (
										<li key={i}>
											<a
												href={n.url}
												target="_blank"
												rel="noreferrer"
												style={{
													color: "inherit",
													textDecoration: "underline",
												}}
											>
												{n.title || n.url}
											</a>
										</li>
									))}
								</ul>
							</section>
						)}
					</div>
				)}
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

export default RiskAndRebalance;
