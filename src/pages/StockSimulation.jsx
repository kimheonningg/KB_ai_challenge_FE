import React, { useEffect, useMemo, useState } from "react";
import {
	generateAndSimulate,
	fetchSimulationHistory,
	deleteSimulation,
} from "../utils/stockSimulation";

import "../styles/aiAssistantPages.css";

const button = {
	padding: "0.6rem 1rem",
	borderRadius: 8,
	border: "none",
	fontWeight: 700,
	cursor: "pointer",
};
const primaryBtn = { ...button, backgroundColor: "#7c3aed", color: "#fff" };
const dangerBtn = { ...button, backgroundColor: "#ef4444", color: "#fff" };
const ghostBtn = {
	...button,
	backgroundColor: "transparent",
	color: "#cbd5e1",
	border: "1px solid #334155",
};

const card = {
	backgroundColor: "#0b1324",
	border: "1px solid #1f2a44",
	borderRadius: 12,
	padding: 16,
	boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
};

const field = {
	display: "flex",
	gap: 12,
	marginBottom: 12,
	alignItems: "center",
};
const label = { width: 180, color: "#a5b4fc", fontWeight: 600 };
const input = {
	flex: 1,
	borderRadius: 8,
	border: "1px solid #334155",
	background: "#0f172a",
	color: "#e5e7eb",
	padding: "10px 12px",
};

const listItem = {
	...card,
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	marginBottom: 12,
	cursor: "pointer",
	minWidth: 0,
};

const spinner = {
	width: 18,
	height: 18,
	border: "3px solid #c4b5fd",
	borderTopColor: "transparent",
	borderRadius: "50%",
	animation: "spin 1s linear infinite",
};

const pageStyle = {
	height: "100vh",
	overflow: "auto",
	padding: 24,
	position: "relative",
};
const containerStyle = {
	maxWidth: 1200,
	margin: "0 auto",
	width: "100%",
};
const rightCol = {
	minWidth: 0,
	display: "grid",
	gap: 16,
	alignContent: "start",
};
const scrollCard = {
	...card,
	maxHeight: "60vh",
	overflowY: "auto",
	minWidth: 0,
};

const StockSimulation = () => {
	const [history, setHistory] = useState([]);
	const [selected, setSelected] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [viewMode, setViewMode] = useState(null); // null | 'news' | 'result'
	const [openOptionsId, setOpenOptionsId] = useState(null); // history item action menu

	// FakeNewsRequest form
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [symbols, setSymbols] = useState(""); // comma-separated
	const [simulationDays, setSimulationDays] = useState(30);
	const [confidenceLevel, setConfidenceLevel] = useState(0.95);

	const formBody = useMemo(() => {
		const promptBase = `${title ? `[${title}] ` : ""}${content}`.trim();
		return {
			prompt: promptBase,
			symbols: symbols
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		};
	}, [title, content, symbols]);

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			setError(null);
			try {
				const data = await fetchSimulationHistory();
				const sims = (data?.simulations || []).map((s) => {
					const storedTitle =
						typeof window !== "undefined"
							? localStorage.getItem(`sim_input_title:${s.simulation_id}`)
							: null;
					return storedTitle ? { ...s, _input_title: storedTitle } : s;
				});
				setHistory(sims);
				setSelected(null);
				setViewMode(null);
			} catch (e) {
				setError(e.message || "히스토리 조회 실패");
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const onBack = () => {
		window.location.href = "/?tab=assistant";
	};

	const onGenerate = async () => {
		const symbolsArr = formBody.symbols || [];
		if (!formBody.prompt?.trim())
			return setError("프롬프트(제목+내용)를 입력하세요.");
		if (!symbolsArr.length)
			return setError("최소 1개 이상의 심볼을 입력하세요.");
		if (!Number.isFinite(simulationDays) || simulationDays < 1)
			return setError("시뮬레이션 일수는 1 이상의 숫자여야 합니다.");
		if (!(confidenceLevel > 0 && confidenceLevel < 1))
			return setError("신뢰수준은 0과 1 사이의 소수여야 합니다. (예: 0.95)");

		setLoading(true);
		setError(null);
		try {
			const res = await generateAndSimulate({
				body: formBody,
				simulation_days: simulationDays,
				confidence_level: confidenceLevel,
			});
			const withTitle = { ...res, _input_title: title };
			try {
				if (withTitle?.simulation_id && typeof window !== "undefined") {
					localStorage.setItem(
						`sim_input_title:${withTitle.simulation_id}`,
						title || ""
					);
				}
			} catch {}
			setHistory((prev) => [...prev, withTitle]);
			setSelected(withTitle);
			setViewMode(null);
			setOpenOptionsId(res.simulation_id);
		} catch (e) {
			const detail = e?.response?.data || e?.message || "시뮬레이션 생성 실패";
			const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	const onDelete = async (simulationId, e) => {
		e?.stopPropagation?.();
		setLoading(true);
		setError(null);
		try {
			const res = await deleteSimulation(simulationId);
			if (res?.success) {
				setHistory((prev) =>
					prev.filter((s) => s.simulation_id !== simulationId)
				);
				if (selected?.simulation_id === simulationId) setSelected(null);
			} else {
				setError("삭제 실패: 서버에서 실패 응답");
			}
		} catch (e) {
			setError(e.message || "삭제 실패");
		} finally {
			setLoading(false);
		}
	};

	const getHistoryTitle = (item) => {
		try {
			if (item?._input_title && String(item._input_title).trim())
				return String(item._input_title).trim();
			try {
				const ls =
					typeof window !== "undefined"
						? localStorage.getItem(`sim_input_title:${item?.simulation_id}`)
						: null;
				if (ls && ls.trim()) return ls.trim();
			} catch {}
			const fn = item?.fake_news || item?.FAKE_NEWS;
			if (!fn || typeof fn !== "object") return null;
			let title =
				fn.fake_news_title || fn.TITLE || fn.title || fn.headline || null;
			if (typeof title === "string" && /^```/.test(title.trim())) title = null;
			if (title && title.trim()) return title.trim();

			let content =
				fn.fake_news_content || fn.CONTENT || fn.content || fn.body || null;
			if (typeof content !== "string") return null;

			let s = content.trim();
			s = s
				.replace(/^```[a-zA-Z]*\n?/, "")
				.replace(/\n?```$/, "")
				.trim();
			try {
				const j = JSON.parse(s);
				const t = j?.title;
				if (t && typeof t === "string") return t;
			} catch {
				const firstLine = s.split(/\r?\n/)[0];
				if (firstLine) return firstLine.slice(0, 140);
			}
			return null;
		} catch {
			return null;
		}
	};

	return (
		<div className="page" style={pageStyle}>
			<span
				className="material-icons"
				style={{
					position: "absolute",
					top: 24,
					left: 24,
					fontSize: 28,
					cursor: "pointer",
				}}
				onClick={onBack}
				title="뒤로가기"
			>
				arrow_back
			</span>

			<div className="container" style={containerStyle}>
				<div className="header-wrapper">
					<h1 className="header-title">주가 변동 시뮬레이션</h1>
				</div>

				{error && (
					<div style={{ marginBottom: 16, color: "#f87171", fontWeight: 700 }}>
						{error}
					</div>
				)}

				<section
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: 16,
						marginBottom: 24,
						alignItems: "start",
					}}
				>
					{/* 좌측: 입력 폼 */}
					<div style={card}>
						<div
							style={{ fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}
						>
							입력 (FakeNewsRequest)
						</div>
						<div style={field}>
							<label style={label}>제목</label>
							<input
								style={input}
								value={title}
								onChange={(e) => setTitle(e.target.value)}
							/>
						</div>
						<div style={field}>
							<label style={label}>내용</label>
							<textarea
								style={{ ...input, minHeight: 120, resize: "vertical" }}
								value={content}
								onChange={(e) => setContent(e.target.value)}
							/>
						</div>
						<div style={field}>
							<label style={label}>심볼(쉼표로 구분)</label>
							<input
								style={input}
								placeholder="AAPL,MSFT,TSLA"
								value={symbols}
								onChange={(e) => setSymbols(e.target.value)}
							/>
						</div>
						<div style={field}>
							<label style={label}>시뮬레이션 일수</label>
							<input
								style={input}
								type="number"
								min={1}
								max={365}
								value={simulationDays}
								onChange={(e) => setSimulationDays(Number(e.target.value))}
							/>
						</div>
						<div style={field}>
							<label style={label}>신뢰수준</label>
							<input
								style={input}
								type="number"
								step="0.01"
								min={0.5}
								max={0.999}
								value={confidenceLevel}
								onChange={(e) => setConfidenceLevel(Number(e.target.value))}
							/>
						</div>
						<div
							style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
						>
							<button
								style={ghostBtn}
								onClick={() => {
									setTitle("");
									setContent("");
									setSymbols("");
								}}
							>
								초기화
							</button>
							<button
								style={primaryBtn}
								onClick={onGenerate}
								disabled={loading}
							>
								생성 + 시뮬레이션
							</button>
						</div>
					</div>

					{/* 우측: 히스토리 + 뷰 */}
					<div style={rightCol}>
						<div style={{ ...scrollCard, marginBottom: 0 }}>
							<div
								style={{ fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}
							>
								시뮬레이션 히스토리
							</div>
							{loading && (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										margin: "6px 0 12px",
										color: "#cbd5e1",
									}}
								>
									<div style={spinner} />
									<span>시뮬레이션 생성 중...</span>
								</div>
							)}
							<div
								style={{
									maxHeight: "40vh",
									overflowY: "auto",
									minWidth: 0,
								}}
							>
								{history.length === 0 && (
									<div style={{ color: "#cbd5e1" }}>기록이 없습니다.</div>
								)}
								{history.map((item) => (
									<div
										key={item.simulation_id}
										style={listItem}
										onClick={() => {
											setSelected(item);
										}}
									>
										<div style={{ minWidth: 0 }}>
											<div style={{ fontWeight: 700 }}>
												ID:{" "}
												<span
													style={{
														textDecoration: "underline",
														cursor: "pointer",
													}}
													onClick={(e) => {
														e.stopPropagation();
														setOpenOptionsId((prev) =>
															prev === item.simulation_id
																? null
																: item.simulation_id
														);
													}}
													title="옵션 열기"
												>
													{item.simulation_id}
												</span>
											</div>
											{(() => {
												const t = getHistoryTitle(item);
												return t ? (
													<div
														style={{
															color: "#e2e8f0",
															fontWeight: 600,
															marginTop: 4,
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
															maxWidth: 520,
														}}
													>
														{t}
													</div>
												) : null;
											})()}
											<div style={{ color: "#94a3b8" }}>
												{new Date(item.generated_at).toLocaleString()}
											</div>
											{openOptionsId === item.simulation_id && (
												<div style={{ display: "flex", gap: 8, marginTop: 8 }}>
													<button
														style={ghostBtn}
														onClick={(e) => {
															e.stopPropagation();
															setSelected(item);
															setViewMode("news");
														}}
													>
														뉴스 보기
													</button>
													<button
														style={ghostBtn}
														onClick={(e) => {
															e.stopPropagation();
															setSelected(item);
															setViewMode("result");
														}}
													>
														시뮬레이션 결과 보기
													</button>
												</div>
											)}
										</div>
										<div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
											<button
												style={dangerBtn}
												onClick={(e) => onDelete(item.simulation_id, e)}
											>
												삭제
											</button>
										</div>
									</div>
								))}
							</div>
						</div>

						{selected && viewMode === "news" && (
							<NewsViewer result={selected} />
						)}
						{selected &&
							viewMode === "result" &&
							(loading ? (
								<div
									style={{
										...scrollCard,
										display: "flex",
										alignItems: "center",
										gap: 12,
										color: "#cbd5e1",
									}}
								>
									<div style={spinner} /> 결과를 불러오는 중...
								</div>
							) : (
								<ResultViewer result={selected} />
							))}
					</div>
				</section>
			</div>

			<style>{`
				@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }

				/* ==== 스크롤바 커스텀 ==== */
				/* Webkit 기반 (Chrome, Edge, Safari) */
				::-webkit-scrollbar {
					height: 8px;
					width: 8px;
				}
				::-webkit-scrollbar-track {
					background: rgba(255, 255, 255, 0.08);
					border-radius: 4px;
				}
				::-webkit-scrollbar-thumb {
					background: rgba(156, 163, 175, 0.7); /* 밝은 회색 */
					border-radius: 4px;
				}
				::-webkit-scrollbar-thumb:hover {
					background: rgba(229, 231, 235, 0.9); /* hover 시 더 밝게 */
				}

				/* Firefox */
				* {
					scrollbar-width: thin;
					scrollbar-color: rgba(156, 163, 175, 0.7) rgba(255, 255, 255, 0.08);
				}
				`}</style>
		</div>
	);
};

export default StockSimulation;

/* ---------- Result Viewer ---------- */
const ResultViewer = ({ result }) => {
	const [showRaw, setShowRaw] = useState(false);

	const metaRows = [
		["시뮬레이션 ID", result.simulation_id],
		[
			"생성 시각",
			result.generated_at
				? new Date(result.generated_at).toLocaleString()
				: "-",
		],
		["일수", result.simulation_days],
		["신뢰수준", result.confidence_level],
		[
			"심볼",
			Array.isArray(result.symbols)
				? result.symbols.join(", ")
				: result.symbols,
		],
	].filter(([, v]) => v !== undefined && v !== null && v !== "");

	const pickArray = (obj) => {
		if (!obj || typeof obj !== "object") return null;
		const priority = [
			"results",
			"simulations",
			"stocks",
			"items",
			"entries",
			"by_symbol",
			"symbol_results",
			"details",
		];
		for (const k of priority) {
			if (
				Array.isArray(obj[k]) &&
				obj[k].every((e) => e && typeof e === "object")
			)
				return obj[k];
		}
		for (const v of Object.values(obj)) {
			if (Array.isArray(v) && v.every((e) => e && typeof e === "object"))
				return v;
		}
		return null;
	};

	const dataArray = useMemo(() => pickArray(result), [result]);

	const columns = useMemo(() => {
		if (!dataArray || dataArray.length === 0) return [];
		const keySet = new Set();
		for (const row of dataArray.slice(0, 50)) {
			Object.keys(row).forEach((k) => keySet.add(k));
			if (keySet.size > 20) break;
		}
		const preferred = [
			"symbol",
			"ticker",
			"base_price",
			"current_price",
			"expected_return",
			"volatility",
			"VaR",
			"CVaR",
			"p5",
			"p95",
			"final_price",
		];
		const all = Array.from(keySet);
		const pref = preferred.filter((k) => keySet.has(k));
		const rest = all.filter((k) => !pref.includes(k));
		return [...pref, ...rest].slice(0, 12);
	}, [dataArray]);

	const formatCell = (val) => {
		if (val === null || val === undefined) return "-";
		if (typeof val === "number") {
			const abs = Math.abs(val);
			if (abs >= 1000) return val.toLocaleString();
			return Number.isInteger(val) ? String(val) : val.toFixed(4);
		}
		if (typeof val === "string")
			return val.length > 120 ? val.slice(0, 117) + "..." : val;
		if (typeof val === "object") return JSON.stringify(val);
		return String(val);
	};

	return (
		<div style={scrollCard}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 12,
				}}
			>
				<div style={{ fontWeight: 700, color: "#a5b4fc" }}>결과</div>
				<button style={ghostBtn} onClick={() => setShowRaw((s) => !s)}>
					{showRaw ? "표로 보기" : "RAW 보기"}
				</button>
			</div>

			{!showRaw && (
				<>
					{metaRows.length > 0 && (
						<div
							style={{
								marginBottom: 12,
								display: "grid",
								gridTemplateColumns: "160px 1fr",
								gap: 8,
								minWidth: 0,
							}}
						>
							{metaRows.map(([k, v], i) => (
								<React.Fragment key={k + "_" + i}>
									<div style={{ color: "#93c5fd", fontWeight: 700 }}>{k}</div>
									<div style={{ color: "#e5e7eb", minWidth: 0 }}>
										{String(v)}
									</div>
								</React.Fragment>
							))}
						</div>
					)}

					{Array.isArray(dataArray) && dataArray.length > 0 ? (
						<div
							style={{
								overflowX: "auto",
								border: "1px solid #1f2a44",
								borderRadius: 8,
								minWidth: 0,
							}}
						>
							<table style={{ width: "100%", borderCollapse: "collapse" }}>
								<thead>
									<tr>
										{columns.map((c) => (
											<th
												key={c}
												style={{
													textAlign: "left",
													padding: "10px 12px",
													background: "#0b1222",
													color: "#93c5fd",
													borderBottom: "1px solid #1f2a44",
													whiteSpace: "nowrap",
												}}
											>
												{c}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{dataArray.map((row, idx) => (
										<tr key={idx}>
											{columns.map((c) => (
												<td
													key={c}
													style={{
														padding: "10px 12px",
														borderBottom: "1px solid #1f2a44",
														color: "#e5e7eb",
														verticalAlign: "top",
													}}
												>
													{formatCell(row[c])}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div style={{ color: "#cbd5e1" }}>
							표로 표시할 배열 결과를 찾지 못했습니다.
						</div>
					)}
				</>
			)}

			{showRaw && (
				<pre style={{ whiteSpace: "pre-wrap", color: "#e5e7eb", margin: 0 }}>
					{JSON.stringify(result, null, 2)}
				</pre>
			)}
		</div>
	);
};

/* ---------- News Viewer ---------- */
const NewsViewer = ({ result }) => {
	const parseFakeNews = (obj) => {
		const fn = obj?.FAKE_NEWS || obj?.fake_news || null;
		if (!fn || typeof fn !== "object") return null;

		const parseNestedJSONString = (text) => {
			if (typeof text !== "string") return { title: null, content: null };
			let s = text.trim();
			s = s
				.replace(/^```[a-zA-Z]*\n?/, "")
				.replace(/\n?```$/, "")
				.trim();
			try {
				const j = JSON.parse(s);
				return { title: j?.title || null, content: j?.content || null };
			} catch {
				return { title: null, content: s || null };
			}
		};

		let title =
			fn.fake_news_title || fn.TITLE || fn.title || fn.headline || null;
		let content =
			fn.fake_news_content || fn.CONTENT || fn.content || fn.body || null;

		if (typeof content === "string") {
			const parsed = parseNestedJSONString(content);
			if (parsed.title) title = parsed.title;
			if (parsed.content) content = parsed.content;
		}
		if (typeof title === "string" && /^```/.test(title.trim())) title = null;

		if (!title && !content) return null;
		return { title, content };
	};

	const parseTopLevelSnakeCase = (obj) => {
		const title = obj?.fake_news_title || obj?.FAKE_NEWS_TITLE || null;
		const content = obj?.fake_news_content || obj?.FAKE_NEWS_CONTENT || null;
		if (!title && !content) return null;
		return { title, content };
	};

	const deepFindNews = (node, visited = new Set()) => {
		if (!node || typeof node !== "object") return null;
		if (visited.has(node)) return null;
		visited.add(node);

		const direct = parseTopLevelSnakeCase(node) || parseFakeNews(node);
		if (direct) return direct;

		const keys = [
			"news",
			"article",
			"summary",
			"generated_news",
			"prompt",
			"content",
		];
		for (const k of keys) {
			if (typeof node[k] === "string" && node[k].trim())
				return { title: null, content: node[k] };
		}
		for (const v of Object.values(node)) {
			if (Array.isArray(v) && v.every((x) => typeof x === "string"))
				return { title: null, content: v.join("\n\n") };
		}
		for (const v of Object.values(node)) {
			if (v && typeof v === "object") {
				const found = deepFindNews(v, visited);
				if (found) return found;
			}
		}
		return null;
	};

	const news = useMemo(() => deepFindNews(result) || null, [result]);

	return (
		<div style={scrollCard}>
			<div style={{ fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}>
				뉴스 보기
			</div>
			{news ? (
				<article
					style={{
						background: "#111827",
						borderRadius: 8,
						padding: 16,
						color: "#e5e7eb",
					}}
				>
					{news.title && (
						<h2
							style={{
								marginTop: 0,
								marginBottom: 12,
								fontSize: 20,
								fontWeight: 800,
							}}
						>
							{news.title}
						</h2>
					)}
					{news.content && (
						<div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
							{news.content}
						</div>
					)}
				</article>
			) : (
				<div style={{ color: "#cbd5e1" }}>
					표시할 뉴스 본문을 찾지 못했습니다.
				</div>
			)}
		</div>
	);
};
