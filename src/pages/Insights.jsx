import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { fetchDailyBriefing } from "../utils/insights";
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
const panelCard = {
	backgroundColor: "#1e293b",
	borderRadius: 12,
	padding: "1.25rem 1.5rem",
	boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
};
const tdStyle = {
	padding: "12px 16px",
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
				whiteSpace: "nowrap",
			}}
		>
			{children}
		</span>
	);
};

const CardMover = ({ title, mover, tone }) => (
	<Box>
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				marginBottom: 8,
			}}
		>
			<div style={{ fontWeight: 700, color: "#e5e7eb" }}>{title}</div>
			<Chip tone={tone}>{tone === "green" ? "급등" : "급락"}</Chip>
		</div>
		{!mover ? (
			<div style={{ color: "#94a3b8" }}>데이터가 없습니다.</div>
		) : (
			<div style={{ display: "grid", gap: 6 }}>
				<div style={{ color: "#e5e7eb", fontWeight: 700 }}>
					{mover.ticker || mover.symbol || "-"}
				</div>
				<div style={{ color: tone === "green" ? "#86efac" : "#fecaca" }}>
					{typeof mover.changePct === "number"
						? `${mover.changePct > 0 ? "+" : ""}${mover.changePct.toFixed(2)}%`
						: mover.change ?? "-"}
				</div>
				{mover.sector && <div style={{ color: "#cbd5e1" }}>{mover.sector}</div>}
				{mover.analysis && (
					<div style={{ color: "#cbd5e1" }}>{mover.analysis}</div>
				)}
				{mover.education && (
					<Box style={{ background: "#0b1222" }}>
						<div style={{ fontWeight: 700, color: "#e5e7eb", marginBottom: 6 }}>
							학습 포인트
						</div>
						{Array.isArray(mover.education) ? (
							<ul style={{ margin: 0, paddingLeft: 18, color: "#cbd5e1" }}>
								{mover.education.map((t, i) => (
									<li key={i}>{t}</li>
								))}
							</ul>
						) : (
							<div style={{ color: "#cbd5e1" }}>{mover.education}</div>
						)}
					</Box>
				)}
			</div>
		)}
	</Box>
);

const Insights = () => {
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState("");
	const [data, setData] = useState(null);

	const loadBriefing = async () => {
		setErr("");
		setLoading(true);
		try {
			const json = await fetchDailyBriefing();
			setData(json);
		} catch (e) {
			setErr(e.message || String(e));
			setData(null);
		} finally {
			setLoading(false);
		}
	};

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
					<div style={{ color: "#94a3b8" }}>
						내 보유종목과 연관된 핵심 이벤트 & 급등/급락 분석
					</div>
				</div>

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
											marginLeft: 10,
											fontSize: 24,
											fontWeight: 800,
											color: "#e5e7eb",
											marginBottom: 8,
										}}
									>
										곧 있을 경제/금융 이벤트와 그에 따른 포트폴리오에 미치는
										영향
									</div>
									<div style={{ display: "grid", gap: 12 }}>
										{data.economic_events.map((ev, idx) => (
											<div
												key={idx}
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
														gap: 8,
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

							{/* Top gainer / loser */}
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
									gap: 12,
								}}
							>
								<CardMover
									title="가장 크게 오른 주식"
									mover={data.top_gainer}
									tone="green"
								/>
								<CardMover
									title="가장 크게 내린 주식"
									mover={data.top_loser}
									tone="red"
								/>
							</div>
						</div>
					)}
				</section>
				<section style={{ ...panelCard, marginTop: 20 }}>
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
						<button onClick={() => {}} style={buttonStyle} disabled={loading}>
							{loading ? (
								<span style={spinnerStyle} />
							) : (
								<span className="material-icons">auto_awesome</span>
							)}
							<span>{loading ? "불러오는 중..." : "실험하기"}</span>
						</button>
					</div>
				</section>
			</div>

			<style>{`
        @keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }
      `}</style>
		</div>
	);
};

export default Insights;
