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
        setHistory(data?.simulations || []);
        if (data?.simulations?.length) setSelected(data.simulations[0]);
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
      setHistory((prev) => [...prev, res]);
      setSelected(res);
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
            시뮬레이션 생성
            {loading && <span style={{ marginLeft: 8, ...spinner }} />}
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
              <div>
                {history.length === 0 && <div style={{ color: "#cbd5e1" }}>기록이 없습니다.</div>}
                {history.map((item) => (
                  <div
                    key={item.simulation_id}
                    style={listItem}
                    onClick={() => setSelected(item)}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>ID: {item.simulation_id}</div>
                      <div style={{ color: "#94a3b8" }}>{new Date(item.generated_at).toLocaleString()}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={dangerBtn} onClick={(e) => onDelete(item.simulation_id, e)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected && (
              <ResultViewer result={selected} />
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

