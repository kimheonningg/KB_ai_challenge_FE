import React, { useEffect, useMemo, useState } from "react";
import {
  generateAndSimulate,
  fetchSimulationHistory,
  deleteSimulation,
} from "../utils/Stock_Simulation";

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#0f172a",
  color: "#f8fafc",
  fontFamily: "'Inter', sans-serif",
  padding: "2rem",
  boxSizing: "border-box",
  position: "relative",
};

const containerStyle = {
  maxWidth: 1000,
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const titleStyle = { fontWeight: 800, fontSize: "1.8rem" };

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

const field = { display: "flex", gap: 12, marginBottom: 12, alignItems: "center" };
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
};

const spinner = {
  width: 18,
  height: 18,
  border: "3px solid #c4b5fd",
  borderTopColor: "transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
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
          const storedTitle = typeof window !== "undefined" ? localStorage.getItem(`sim_input_title:${s.simulation_id}`) : null;
          return storedTitle ? { ...s, _input_title: storedTitle } : s;
        });
        setHistory(sims);
        // 최초 로드 시 자동 표시하지 않음
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
    // 기본 유효성 검사: 필수 입력값 확인
    const symbolsArr = formBody.symbols || [];
    if (!formBody.prompt?.trim()) {
      setError("프롬프트(제목+내용)를 입력하세요.");
      return;
    }
    if (!symbolsArr.length) {
      setError("최소 1개 이상의 심볼을 입력하세요.");
      return;
    }
    if (!Number.isFinite(simulationDays) || simulationDays < 1) {
      setError("시뮬레이션 일수는 1 이상의 숫자여야 합니다.");
      return;
    }
    if (!(confidenceLevel > 0 && confidenceLevel < 1)) {
      setError("신뢰수준은 0과 1 사이의 소수여야 합니다. (예: 0.95)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await generateAndSimulate({
        body: formBody,
        simulation_days: simulationDays,
        confidence_level: confidenceLevel,
      });
      // append to history and select
      const withTitle = { ...res, _input_title: title };
      try {
        if (withTitle?.simulation_id && typeof window !== "undefined") {
          localStorage.setItem(`sim_input_title:${withTitle.simulation_id}`, title || "");
        }
      } catch {}
      setHistory((prev) => [...prev, withTitle]);
      setSelected(withTitle);
      setViewMode(null); // 자동 표시하지 않음
      setOpenOptionsId(res.simulation_id); // 방금 생성한 항목 옵션 열기
    } catch (e) {
      // 서버의 422 등 상세 오류 메시지 노출
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
        setHistory((prev) => prev.filter((s) => s.simulation_id !== simulationId));
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

  // 히스토리 타이틀 추출: 입력 제목 우선, 없으면 fake_news에서 유추
  const getHistoryTitle = (item) => {
    try {
      if (item?._input_title && String(item._input_title).trim()) return String(item._input_title).trim();
      try {
        const ls = typeof window !== "undefined" ? localStorage.getItem(`sim_input_title:${item?.simulation_id}`) : null;
        if (ls && ls.trim()) return ls.trim();
      } catch {}
      const fn = item?.fake_news || item?.FAKE_NEWS;
      if (!fn || typeof fn !== "object") return null;
      let title = fn.fake_news_title || fn.TITLE || fn.title || fn.headline || null;
      if (typeof title === "string" && /^```/.test(title.trim())) title = null;
      if (title && title.trim()) return title.trim();

      let content = fn.fake_news_content || fn.CONTENT || fn.content || fn.body || null;
      if (typeof content !== "string") return null;

      let s = content.trim();
      s = s.replace(/^```[a-zA-Z]*\n?/, "");
      s = s.replace(/\n?```$/, "");
      s = s.trim();
      try {
        const j = JSON.parse(s);
        const t = j?.title;
        if (t && typeof t === "string") return t;
      } catch (e) {
        // not JSON; fallback: 첫 줄을 제목으로 사용
        const firstLine = s.split(/\r?\n/)[0];
        if (firstLine) return firstLine.slice(0, 140);
      }
      return null;
    } catch {
      return null;
    }
  };

  return (
    <div style={pageStyle}>
      <span
        className="material-icons"
        style={{ position: "absolute", top: 24, left: 24, fontSize: 28, cursor: "pointer" }}
        onClick={onBack}
        title="뒤로가기"
      >
        arrow_back
      </span>

      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>주가 변동 시뮬레이션</h1>
          <button style={primaryBtn} onClick={onGenerate} disabled={loading}>
            {loading ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={spinner} /> 생성 중...
              </span>
            ) : (
              "시뮬레이션 생성"
            )}
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 16, color: "#f87171", fontWeight: 700 }}>{error}</div>
        )}

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={card}>
            <div style={{ fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}>
              입력 (FakeNewsRequest)
            </div>
            <div style={field}>
              <label style={label}>제목</label>
              <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} />
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
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button style={ghostBtn} onClick={() => { setTitle(""); setContent(""); setSymbols(""); }}>초기화</button>
              <button style={primaryBtn} onClick={onGenerate} disabled={loading}>생성 + 시뮬레이션</button>
            </div>
          </div>

          <div>
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}>시뮬레이션 히스토리</div>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 12px", color: "#cbd5e1" }}>
                  <div style={spinner} />
                  <span>시뮬레이션 생성 중...</span>
                </div>
              )}
              <div>
                {history.length === 0 && <div style={{ color: "#cbd5e1" }}>기록이 없습니다.</div>}
                {history.map((item) => (
                  <div
                    key={item.simulation_id}
                    style={listItem}
                    onClick={() => { setSelected(item); /* 보기 모드는 옵션에서 선택 */ }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        ID: {" "}
                        <span
                          style={{ textDecoration: "underline", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenOptionsId((prev) => (prev === item.simulation_id ? null : item.simulation_id));
                          }}
                          title="옵션 열기"
                        >
                          {item.simulation_id}
                        </span>
                      </div>
                      {(() => {
                        const title = getHistoryTitle(item);
                        return title ? (
                          <div style={{ color: "#e2e8f0", fontWeight: 600, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 520 }}>
                            {title}
                          </div>
                        ) : null;
                      })()}
                      <div style={{ color: "#94a3b8" }}>{new Date(item.generated_at).toLocaleString()}</div>
                      {openOptionsId === item.simulation_id && (
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            style={ghostBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(item);
                              setViewMode("news");
                              setOpenOptionsId(null);
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
                              setOpenOptionsId(null);
                            }}
                          >
                            시뮬레이션 결과 보기
                          </button>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={dangerBtn} onClick={(e) => onDelete(item.simulation_id, e)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected && viewMode === "news" && <NewsViewer result={selected} />}
            {selected && viewMode === "result" && (
              loading ? (
                <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, color: "#cbd5e1" }}>
                  <div style={spinner} /> 결과를 불러오는 중...
                </div>
              ) : (
                <ResultViewer result={selected} />
              )
            )}
          </div>
        </section>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);}
          }
        `}
      </style>
    </div>
  );
};

export default StockSimulation;

// 결과 보기 컴포넌트: 요약 + 표 + RAW 토글
const ResultViewer = ({ result }) => {
  const [showRaw, setShowRaw] = useState(false);

  const metaRows = [
    ["시뮬레이션 ID", result.simulation_id],
    ["생성 시각", result.generated_at ? new Date(result.generated_at).toLocaleString() : "-"],
    ["일수", result.simulation_days],
    ["신뢰수준", result.confidence_level],
    ["심볼", Array.isArray(result.symbols) ? result.symbols.join(", ") : result.symbols],
  ].filter(([, v]) => v !== undefined && v !== null && v !== "");

  // 가능한 배열 결과 탐색
  const pickArray = (obj) => {
    if (!obj || typeof obj !== "object") return null;
    const priorityKeys = [
      "results",
      "simulations",
      "stocks",
      "items",
      "entries",
      "by_symbol",
      "symbol_results",
      "details",
    ];
    for (const k of priorityKeys) {
      if (Array.isArray(obj[k]) && obj[k].every((e) => e && typeof e === "object")) {
        return obj[k];
      }
    }
    // fallback: 첫 번째로 발견되는 객체 배열
    for (const v of Object.values(obj)) {
      if (Array.isArray(v) && v.every((e) => e && typeof e === "object")) {
        return v;
      }
    }
    return null;
  };

  const dataArray = useMemo(() => pickArray(result), [result]);

  const columns = useMemo(() => {
    if (!dataArray || dataArray.length === 0) return [];
    // keys union (상위 20개 제한)
    const keySet = new Set();
    for (const row of dataArray.slice(0, 50)) {
      Object.keys(row).forEach((k) => keySet.add(k));
      if (keySet.size > 20) break;
    }
    // 심볼/핵심 컬럼을 앞으로 정렬
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
    if (typeof val === "string") return val.length > 120 ? val.slice(0, 117) + "..." : val;
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontWeight: 700, color: "#a5b4fc" }}>결과</div>
        <button style={ghostBtn} onClick={() => setShowRaw((s) => !s)}>
          {showRaw ? "표로 보기" : "RAW 보기"}
        </button>
      </div>

      {!showRaw && (
        <>
          {metaRows.length > 0 && (
            <div style={{ marginBottom: 12, display: "grid", gridTemplateColumns: "160px 1fr", gap: 8 }}>
              {metaRows.map(([k, v]) => (
                <>
                  <div key={k + "_k"} style={{ color: "#93c5fd", fontWeight: 700 }}>{k}</div>
                  <div key={k + "_v"} style={{ color: "#e5e7eb" }}>{String(v)}</div>
                </>
              ))}
            </div>
          )}

          {Array.isArray(dataArray) && dataArray.length > 0 ? (
            <div style={{ overflowX: "auto", border: "1px solid #1f2a44", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c} style={{ textAlign: "left", padding: "10px 12px", background: "#0b1222", color: "#93c5fd", borderBottom: "1px solid #1f2a44" }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataArray.map((row, idx) => (
                    <tr key={idx}>
                      {columns.map((c) => (
                        <td key={c} style={{ padding: "10px 12px", borderBottom: "1px solid #1f2a44", color: "#e5e7eb" }}>
                          {formatCell(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: "#cbd5e1" }}>표로 표시할 배열 결과를 찾지 못했습니다.</div>
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

// 뉴스 보기 컴포넌트: RAW 결과에서 FAKE_NEWS TITLE/CONTENT 또는 fake_news_title/fake_news_content를 우선 추출
const NewsViewer = ({ result }) => {
  // 특정 구조: result.FAKE_NEWS?.TITLE / result.FAKE_NEWS?.CONTENT 우선
  const parseFakeNews = (obj) => {
    const fn = obj?.FAKE_NEWS || obj?.fake_news || null;
    if (!fn || typeof fn !== "object") return null;

    // helper: strip code fences and parse nested JSON
    const parseNestedJSONString = (text) => {
      if (typeof text !== "string") return { title: null, content: null };
      let s = text.trim();
      // remove leading ```json or ``` and trailing ```
      s = s.replace(/^```[a-zA-Z]*\n?/, "");
      s = s.replace(/\n?```$/, "");
      s = s.trim();
      try {
        const j = JSON.parse(s);
        const t = j?.title || null;
        const c = j?.content || null;
        return { title: t, content: c };
      } catch (e) {
        return { title: null, content: s || null };
      }
    };

    // direct fields including snake_case
    let title = fn.fake_news_title || fn.TITLE || fn.title || fn.headline || null;
    let content = fn.fake_news_content || fn.CONTENT || fn.content || fn.body || null;

    // if content is a JSON-like string, parse it to get title/content
    if (typeof content === "string") {
      const parsed = parseNestedJSONString(content);
      // only overwrite if parsed content exists
      if (parsed.title) title = parsed.title;
      if (parsed.content) content = parsed.content;
    }

    // ignore code-fence-only titles like ```json
    if (typeof title === "string" && /^```/.test(title.trim())) {
      title = null;
    }

    if (!title && !content) return null;
    return { title, content };
  };

  // 최상위 snake_case 키 지원: fake_news_title / fake_news_content
  const parseTopLevelSnakeCase = (obj) => {
    const title = obj?.fake_news_title || obj?.FAKE_NEWS_TITLE || null;
    const content = obj?.fake_news_content || obj?.FAKE_NEWS_CONTENT || null;
    if (!title && !content) return null;
    return { title, content };
  };

  // 깊은 탐색으로 어디에 있든 찾아낸다
  const deepFindNews = (node, visited = new Set()) => {
    if (!node || typeof node !== "object") return null;
    if (visited.has(node)) return null;
    visited.add(node);

    // 1) 현재 레벨 검사
    const direct = parseTopLevelSnakeCase(node) || parseFakeNews(node);
    if (direct) return direct;

    // 2) 일반 텍스트 후보
    const keys = ["news", "article", "summary", "generated_news", "prompt", "content"];
    for (const k of keys) {
      if (typeof node[k] === "string" && node[k].trim()) return { title: null, content: node[k] };
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v) && v.every((x) => typeof x === "string")) return { title: null, content: v.join("\n\n") };
    }

    // 3) 하위로 재귀 탐색
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
    <div style={card}>
      <div style={{ fontWeight: 700, marginBottom: 12, color: "#a5b4fc" }}>뉴스 보기</div>
      {news ? (
        <article style={{ background: "#111827", borderRadius: 8, padding: 16, color: "#e5e7eb" }}>
          {news.title && (
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 20, fontWeight: 800 }}>{news.title}</h2>
          )}
          {news.content && (
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{news.content}</div>
          )}
        </article>
      ) : (
        <div style={{ color: "#cbd5e1" }}>표시할 뉴스 본문을 찾지 못했습니다.</div>
      )}
    </div>
  );
};

