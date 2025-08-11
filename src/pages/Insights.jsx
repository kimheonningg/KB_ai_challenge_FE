import React, { useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
	fetchDailyBriefing,
	runTimeMachine,
	fetchInsightHistory,
} from "../utils/insights";
import "../styles/aiAssistantPages.css";

const buttonStyle = {
	padding: "0.5rem 1.2rem",
	borderRadius: 8,
	background: "#7c3aed",
	color: "#fff",
	border: "none",
	cursor: "pointer",
	fontWeight: 600,
	display: "flex",
	alignItems: "center",
	gap: 6,
};
const toggleButtonStyle = {
	background: "rgba(148, 163, 184, 0.15)",
	border: "1px solid rgba(148, 163, 184, 0.3)",
	color: "#93c5fd",
	fontWeight: 600,
	padding: "6px 12px",
	marginTop: 8,
	cursor: "pointer",
	borderRadius: 8,
	transition: "background 0.2s, border-color 0.2s",
};

const spinnerStyle = {
	width: 20,
	height: 20,
	border: "3px solid #c4b5fd",
	borderTopColor: "transparent",
	borderRadius: "50%",
	animation: "spin 1s linear infinite",
};
const panelCard = {
	background: "#1e293b",
	borderRadius: 12,
	padding: "1.25rem 1.5rem",
	boxShadow: "0 4px 10px rgba(0,0,0,.2)",
};
const inputStyle = {
	borderRadius: 8,
	border: "1px solid #334155",
	background: "#0f172a",
	color: "#e5e7eb",
	padding: "8px 10px",
};
const tdStyle = {
	padding: "10px 12px",
	borderBottom: "1px solid #314256",
	color: "#e5e7eb",
	verticalAlign: "top",
};

const Box = ({ children, style }) => (
	<div
		style={{
			background: "#0f172a",
			border: "1px solid #334155",
			borderRadius: 10,
			padding: 14,
			...style,
		}}
	>
		{children}
	</div>
);

const Chip = ({ tone = "gray", children }) => {
	const map = {
		gray: { bg: "rgba(148,163,184,.15)", bd: "#475569", fg: "#cbd5e1" },
		green: { bg: "rgba(34,197,94,.15)", bd: "#22c55e", fg: "#bbf7d0" },
		red: { bg: "rgba(239,68,68,.15)", bd: "#ef4444", fg: "#fecaca" },
		blue: { bg: "rgba(59,130,246,.15)", bd: "#3b82f6", fg: "#bfdbfe" },
	};
	const t = map[tone];
	return (
		<span
			style={{
				display: "inline-block",
				padding: "2px 8px",
				borderRadius: 999,
				background: t.bg,
				border: `1px solid ${t.bd}`,
				color: t.fg,
				fontSize: 12,
				fontWeight: 700,
			}}
		>
			{children}
		</span>
	);
};

const LineChart = ({ series = [], height = 260, padding = 32 }) => {
	const width = 720;
	const points = series.flatMap((s) => s.data ?? []);
	if (!points.length) return null;
	const xs = points.map((p) => +p.x);
	const ys = points.map((p) => p.y).filter((v) => !Number.isNaN(v));
	const minX = Math.min(...xs),
		maxX = Math.max(...xs);
	const minY = Math.min(...ys),
		maxY = Math.max(...ys);
	const plotW = width - padding * 2,
		plotH = height - padding * 2;
	const sx = (t) => padding + ((t - minX) / (maxX - minX || 1)) * plotW;
	const sy = (v) => padding + (1 - (v - minY) / (maxY - minY || 1)) * plotH;
	const path = (data) =>
		(data || [])
			.filter((p) => !Number.isNaN(p.y))
			.map((p, i) => `${i ? "L" : "M"} ${sx(+p.x)} ${sy(p.y)}`)
			.join(" ");

	return (
		<div style={{ overflowX: "auto" }}>
			<svg width={width} height={height} style={{ display: "block" }}>
				<line
					x1={padding}
					y1={height - padding}
					x2={width - padding}
					y2={height - padding}
					stroke="#334155"
				/>
				<line
					x1={padding}
					y1={padding}
					x2={padding}
					y2={height - padding}
					stroke="#334155"
				/>
				{series.map((s, i) => (
					<path
						key={i}
						d={path(s.data)}
						fill="none"
						stroke={i ? "#a78bfa" : "#60a5fa"}
						strokeWidth="2"
					/>
				))}
				{series.map((s, i) => (
					<g key={`legend-${i}`}>
						<rect
							x={padding + i * 160}
							y={8}
							width="14"
							height="4"
							fill={i ? "#a78bfa" : "#60a5fa"}
						/>
						<text
							x={padding + 22 + i * 160}
							y={13}
							fill="#cbd5e1"
							fontSize="12"
						>
							{s.name}
						</text>
					</g>
				))}
			</svg>
		</div>
	);
};

const Insights = () => {
	// Daily
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");
	const [data, setData] = useState(null);

	// Daily 히스토리
	const [histAll, setHistAll] = useState([]);
	const [histLoading, setHistLoading] = useState(false);
	const [histErr, setHistErr] = useState("");
	const [histPage, setHistPage] = useState(1);
	const pageSize = 5;
	const [histOpen, setHistOpen] = useState(false);

	// Time Machine inputs
	const [base, setBase] = useState("");
	const [cmp, setCmp] = useState("");
	const [amount, setAmount] = useState(null);
	const [date, setDate] = useState(null);

	// Time Machine results
	const [tmLoading, setTmLoading] = useState(false);
	const [tmErr, setTmErr] = useState("");
	const [tm, setTm] = useState(null);

	const loadBriefing = async () => {
		setErr("");
		setLoading(true);
		try {
			setData(await fetchDailyBriefing());
		} catch (e) {
			setErr(e.message || String(e));
			setData(null);
		} finally {
			setLoading(false);
		}
	};

	const onRunTimeMachine = async () => {
		setTmErr("");
		setTm(null);
		setTmLoading(true);
		try {
			const res = await runTimeMachine({
				base_ticker: base.trim().toUpperCase(),
				comparison_ticker: cmp.trim().toUpperCase(),
				investment_amount: Number(amount),
				investment_date: date,
			});
			setTm(res);
		} catch (e) {
			setTmErr(e.message || String(e));
		} finally {
			setTmLoading(false);
		}
	};

	// 그래프용 시리즈 변환 (응답: [{date, TSLA, AAPL}, ...])
	const tmSeries = useMemo(() => {
		if (!tm?.graph_data?.length) return [];
		const b = base.trim().toUpperCase();
		const c = cmp.trim().toUpperCase();
		const baseSeries = tm.graph_data.map((r) => ({
			x: new Date(r.date),
			y: Number(r[b]),
		}));
		const cmpSeries = tm.graph_data.map((r) => ({
			x: new Date(r.date),
			y: Number(r[c]),
		}));
		return [
			{ name: `${b}`, data: baseSeries },
			{ name: `${c}`, data: cmpSeries },
		];
	}, [tm, base, cmp]);

	const currency = (v) =>
		(v == null ? "-" : Math.round(v).toLocaleString("ko-KR")) + "원";
	const pct = (v) => (v == null ? "-" : `${v > 0 ? "+" : ""}${v.toFixed(2)}%`);

	// Insights 제목 생성: briefing_date + 모든 event_name
	const makeInsightTitle = (it) => {
		const date =
			it?.briefing_date ||
			(it?.saved_at ? new Date(it.saved_at).toISOString().slice(0, 10) : "");
		const events = (it?.economic_events || [])
			.map((e) => e?.event_name)
			.filter(Boolean);
		return [date, ...events].join(" · ");
	};

	// Insights 히스토리 로드
	useEffect(() => {
		if (!histOpen || histAll.length) return;
		let alive = true;
		(async () => {
			try {
				setHistLoading(true);
				setHistErr("");
				const arr = await fetchInsightHistory(); // utils로 이동
				const sorted = [...arr].sort(
					(a, b) => new Date(b.saved_at || 0) - new Date(a.saved_at || 0)
				);
				if (alive) setHistAll(sorted);
			} catch (e) {
				if (alive) setHistErr(e.message || String(e));
			} finally {
				if (alive) setHistLoading(false);
			}
		})();
		return () => {
			alive = false;
		};
	}, [histOpen, histAll.length]);

	// Insights 목록 페이지 단위 슬라이스
	const histTotalPages = Math.max(1, Math.ceil(histAll.length / pageSize));
	const histItems = useMemo(() => {
		const start = (histPage - 1) * pageSize;
		return histAll.slice(start, start + pageSize);
	}, [histAll, histPage]);

	return (
		<div className="page">
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
				<div className="header-wrapper" style={{ marginBottom: 16 }}>
					<h1 className="header-title">인사이트 얻기</h1>
					<div style={{ color: "#94a3b8" }}>오늘의 브리핑 & 타임머신 실험</div>
				</div>

				{/* ===== 오늘의 브리핑 ===== */}
				<section style={{ ...panelCard }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: 12,
						}}
					>
						<div>
							<div
								style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: 10 }}
							>
								오늘의 브리핑 받기
							</div>
							<div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.5 }}>
								{data?.briefing_date ? (
									`브리핑 날짜: ${data.briefing_date}`
								) : (
									<>
										곧 있을 큰 경제/금융 이벤트에 대한 정보를 얻어 내 주식에
										대한 조언을 얻고 싶다면?
										<br />
										또 최근의 주식 현황에 대해 궁금하다면?
										<br />
										우측의 버튼을 클릭하여 브리핑을 받아보세요.
									</>
								)}
							</div>
						</div>
						<button
							onClick={loadBriefing}
							style={buttonStyle}
							disabled={loading}
						>
							{loading ? (
								<span style={spinnerStyle} />
							) : (
								<span className="material-icons">auto_awesome</span>
							)}
							<span>{loading ? "불러오는 중..." : "브리핑 받기"}</span>
						</button>
					</div>

					{err && (
						<div style={{ marginTop: 14, color: "#fecaca" }}>오류: {err}</div>
					)}

					{data && (
						<div style={{ marginTop: 16, display: "grid", gap: 16 }}>
							{(data.economic_events?.length || 0) > 0 && (
								<Box>
									<div
										style={{
											fontWeight: 800,
											color: "#e5e7eb",
											marginBottom: 8,
											fontSize: 18,
										}}
									>
										곧 있을 경제/금융 이벤트와 그에 따른 포트폴리오에 미치는
										영향
									</div>
									<div style={{ display: "grid", gap: 12 }}>
										{data.economic_events.map((ev, i) => (
											<div
												key={i}
												style={{
													border: "1px solid #334155",
													borderRadius: 8,
													padding: 12,
													background: "#0b1222",
												}}
											>
												<div
													style={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														marginBottom: 8,
													}}
												>
													<div style={{ color: "#e5e7eb", fontWeight: 700 }}>
														{ev.event_name}
													</div>
													{ev.event_date && (
														<Chip tone="blue">
															{new Date(ev.event_date).toLocaleDateString()}
														</Chip>
													)}
												</div>
												<div style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
													<ReactMarkdown>
														{ev.impact_analysis || "-"}
													</ReactMarkdown>
												</div>
											</div>
										))}
									</div>
								</Box>
							)}

							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
									gap: 12,
								}}
							>
								<Box>
									<div
										style={{
											fontWeight: 700,
											color: "#e5e7eb",
											marginBottom: 6,
										}}
									>
										가장 크게 오른 주식
									</div>
									<div style={{ color: "#94a3b8" }}>
										{data.top_gainer
											? JSON.stringify(data.top_gainer)
											: "데이터 없음"}
									</div>
								</Box>
								<Box>
									<div
										style={{
											fontWeight: 700,
											color: "#e5e7eb",
											marginBottom: 6,
										}}
									>
										가장 크게 내린 주식
									</div>
									<div style={{ color: "#94a3b8" }}>
										{data.top_loser
											? JSON.stringify(data.top_loser)
											: "데이터 없음"}
									</div>
								</Box>
							</div>
						</div>
					)}
					{!histOpen ? (
						<div style={{ marginTop: "24px" }}>
							<button
								onClick={() => setHistOpen(true)}
								style={toggleButtonStyle}
								onMouseEnter={(e) => {
									e.currentTarget.style.background =
										"rgba(148, 163, 184, 0.25)";
									e.currentTarget.style.borderColor =
										"rgba(148, 163, 184, 0.4)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background =
										"rgba(148, 163, 184, 0.15)";
									e.currentTarget.style.borderColor =
										"rgba(148, 163, 184, 0.3)";
								}}
								title="과거 브리핑 목록 보기"
							>
								과거의 브리핑 목록 확인하기
							</button>
						</div>
					) : (
						<div style={{ marginTop: "24px" }}>
							<button
								onClick={() => setHistOpen(false)}
								style={toggleButtonStyle}
								onMouseEnter={(e) => {
									e.currentTarget.style.background =
										"rgba(148, 163, 184, 0.25)";
									e.currentTarget.style.borderColor =
										"rgba(148, 163, 184, 0.4)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.background =
										"rgba(148, 163, 184, 0.15)";
									e.currentTarget.style.borderColor =
										"rgba(148, 163, 184, 0.3)";
								}}
								title="목록 닫기"
							>
								닫기
							</button>
						</div>
					)}

					{histOpen && (
						<>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									gap: 12,
									marginTop: 12,
								}}
							></div>

							{histErr && (
								<div style={{ marginTop: 12, color: "#fecaca" }}>
									오류: {histErr}
								</div>
							)}

							<div style={{ marginTop: 14, display: "grid", gap: 10 }}>
								{histLoading && (
									<div
										style={{ display: "flex", alignItems: "center", gap: 8 }}
									>
										<span style={spinnerStyle} />
										<span style={{ color: "#cbd5e1" }}>불러오는 중...</span>
									</div>
								)}
								{!histLoading && histItems.length === 0 && (
									<div style={{ color: "#94a3b8" }}>
										표시할 인사이트가 없습니다.
									</div>
								)}
								{!histLoading &&
									histItems.map((it, idx) => (
										<div
											key={it.insight_id || it.saved_at || idx}
											style={{
												border: "1px solid #334155",
												borderRadius: 16,
												padding: 16,
												background: "#0b1222",
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												gap: 10,
											}}
										>
											<div style={{ display: "grid", gap: 6 }}>
												<div
													style={{
														color: "#e5e7eb",
														fontWeight: 800,
														fontSize: 18,
													}}
												>
													{makeInsightTitle(it)}
												</div>
												<div style={{ color: "#94a3b8", fontSize: 12 }}>
													저장:{" "}
													{it.saved_at
														? new Date(it.saved_at).toLocaleString()
														: "—"}
												</div>
											</div>
											<button
												style={{
													...buttonStyle,
													padding: "0.5rem 1rem",
													whiteSpace: "nowrap",
												}}
												onClick={() => {
													setData(it);
													window.scrollTo({ top: 0, behavior: "smooth" });
												}}
												title="이 인사이트 열기"
											>
												<span className="material-icons">open_in_new</span>
												열기
											</button>
										</div>
									))}
							</div>

							<div
								style={{
									marginTop: 10,
									color: "#94a3b8",
									display: "flex",
									justifyContent: "flex-end",
									alignItems: "center",
									gap: 12,
								}}
							>
								<>
									페이지 {histAll.length ? histPage : 0} /{" "}
									{histAll.length ? histTotalPages : 0} · 총 {histAll.length}개
								</>
								<div style={{ display: "flex", gap: 8 }}>
									<button
										style={{
											opacity: histPage === 1 ? 0.5 : 1,
										}}
										disabled={histPage === 1 || histLoading}
										onClick={() => setHistPage((p) => Math.max(1, p - 1))}
										title="이전 5개"
									>
										<span className="material-icons">chevron_left</span>
									</button>
									<button
										style={{
											opacity: histPage >= histTotalPages ? 0.5 : 1,
										}}
										disabled={histPage >= histTotalPages || histLoading}
										onClick={() =>
											setHistPage((p) => Math.min(histTotalPages, p + 1))
										}
										title="다음 5개"
									>
										<span className="material-icons">chevron_right</span>
									</button>
								</div>
							</div>
						</>
					)}
				</section>

				{/* ===== 타임머신 ===== */}
				<section style={{ ...panelCard, marginTop: 20 }}>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							gap: 12,
							flexWrap: "wrap",
						}}
					>
						<div>
							<div
								style={{ fontWeight: 700, color: "#a5b4fc", marginBottom: 10 }}
							>
								타임 머신 실험하기
							</div>
							<div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.5 }}>
								<>
									만약 내가 과거에 다른 주식을 샀다면?
									<br />
									우측의 버튼을 클릭하여 브리핑을 받아보세요.
								</>
							</div>
						</div>
						<div
							style={{
								width: "100%",
								display: "flex",
								gap: 8,
								flexWrap: "wrap",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}
							>
								<input
									style={inputStyle}
									value={base}
									onChange={(e) => setBase(e.target.value)}
									placeholder="Base (예: TSLA)"
								/>
								<span style={{ color: "#94a3b8" }}>→</span>
								<input
									style={inputStyle}
									value={cmp}
									onChange={(e) => setCmp(e.target.value)}
									placeholder="Comparison (예: AAPL)"
								/>
								<input
									style={inputStyle}
									type="number"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									min={1}
									placeholder="주식 수량 (KRW)"
								/>
								<input
									style={inputStyle}
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
								/>
							</div>
							<div style={{ marginLeft: 12 }}>
								<button
									onClick={onRunTimeMachine}
									style={buttonStyle}
									disabled={tmLoading}
								>
									{tmLoading ? (
										<span style={spinnerStyle} />
									) : (
										<span className="material-icons">query_stats</span>
									)}
									<span>{tmLoading ? "계산 중..." : "실험하기"}</span>
								</button>
							</div>
						</div>
					</div>

					{tmErr && (
						<div style={{ marginTop: 12, color: "#fecaca" }}>오류: {tmErr}</div>
					)}

					{tm && (
						<div style={{ marginTop: 16, display: "grid", gap: 16 }}>
							{/* 그래프 */}
							<Box>
								<div
									style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 8 }}
								>
									자산가치 추이
								</div>
								<LineChart series={tmSeries} />
							</Box>

							{/* 메트릭 요약 */}
							<Box>
								<div
									style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 8 }}
								>
									최종 지표
								</div>
								<table style={{ width: "100%", borderCollapse: "collapse" }}>
									<thead>
										<tr>
											<th
												style={{
													...tdStyle,
													color: "#93c5fd",
													textAlign: "left",
												}}
											>
												구분
											</th>
											<th
												style={{
													...tdStyle,
													color: "#93c5fd",
													textAlign: "right",
												}}
											>
												최종 가치
											</th>
											<th
												style={{
													...tdStyle,
													color: "#93c5fd",
													textAlign: "right",
												}}
											>
												총수익률
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td style={tdStyle}>{base}</td>
											<td style={{ ...tdStyle, textAlign: "right" }}>
												{currency(
													tm.final_metrics?.base_ticker_metrics?.final_value
												)}
											</td>
											<td style={{ ...tdStyle, textAlign: "right" }}>
												{pct(
													tm.final_metrics?.base_ticker_metrics
														?.total_return_percent
												)}
											</td>
										</tr>
										<tr>
											<td style={tdStyle}>{cmp}</td>
											<td style={{ ...tdStyle, textAlign: "right" }}>
												{currency(
													tm.final_metrics?.comparison_ticker_metrics
														?.final_value
												)}
											</td>
											<td style={{ ...tdStyle, textAlign: "right" }}>
												{pct(
													tm.final_metrics?.comparison_ticker_metrics
														?.total_return_percent
												)}
											</td>
										</tr>
										<tr>
											<td style={tdStyle}>
												<b>차이</b>
											</td>
											<td
												style={{
													...tdStyle,
													textAlign: "right",
													fontWeight: 800,
												}}
											>
												{currency(tm.final_metrics?.profit_difference)}
											</td>
											<td style={{ ...tdStyle, textAlign: "right" }}>—</td>
										</tr>
									</tbody>
								</table>
							</Box>

							{/* AI 해설/교육 */}
							{tm.ai_analysis && (
								<Box>
									<div
										style={{
											fontWeight: 700,
											color: "#e5e7eb",
											marginBottom: 8,
										}}
									>
										AI 분석 & 교육
									</div>
									<div style={{ color: "#cbd5e1", lineHeight: 1.65 }}>
										<ReactMarkdown>{tm.ai_analysis}</ReactMarkdown>
									</div>
								</Box>
							)}
						</div>
					)}
				</section>
			</div>

			<style>{`@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}`}</style>
		</div>
	);
};

export default Insights;
