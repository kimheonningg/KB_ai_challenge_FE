import React, { useState } from "react";
import { submitFeedback } from "../utils/feedback";

const sectionCardStyle = {
	backgroundColor: "rgba(255, 255, 255, 0.05)",
	borderRadius: "1rem",
	padding: "1.5rem 2rem",
	boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
	marginBottom: "2rem",
	border: "1px solid rgba(255,255,255,0.08)",
};

const About = () => {
	const [feedback, setFeedback] = useState("");
	const [loading, setLoading] = useState(false);

	const sendFeedback = async () => {
		setLoading(true);
		try {
			const data = await submitFeedback(feedback);
			if (data.success) {
				alert("의견이 성공적으로 제출되었습니다!");
				setFeedback("");
			} else {
				alert("의견 제출에 실패했습니다.");
			}
		} catch (error) {
			alert(error.message || "서버 오류가 발생했습니다.");
		}
		setLoading(false);
	};

	return (
		<div
			style={{
				padding: "3rem 5vw",
				color: "#f8fafc",
				background: "linear-gradient(to bottom, #1e293b, #0f172a)",
				minHeight: "100vh",
				fontFamily: "'Inter', sans-serif",
				position: "relative",
			}}
		>
			<span
				className="material-icons"
				style={{
					position: "absolute",
					top: "1.5rem",
					left: "1.5rem",
					cursor: "pointer",
					fontSize: "2rem",
					color: "#f8fafc",
				}}
				onClick={() => {
					window.location.href = "/";
				}}
			>
				arrow_back
			</span>

			<header style={{ marginBottom: "2.5rem", textAlign: "center" }}>
				<h1
					style={{
						fontSize: "2.7rem",
						fontWeight: "800",
						marginBottom: "1rem",
					}}
				>
					📘 About
				</h1>
				<p
					style={{
						fontSize: "1.15rem",
						color: "#cbd5e1",
						maxWidth: "760px",
						margin: "0 auto",
					}}
				>
					이 플랫폼은 <b>KB Future Finance A.I. Challenge</b>를 위해 개발된
					<b style={{ color: "#38bdf8" }}> AI 기반 주식 분석 서비스</b>입니다.
					<br />
					다양한 금융 데이터를 통합해 사용자의 투자 의사결정을 돕습니다.
				</p>
			</header>

			<section style={sectionCardStyle}>
				<h2
					style={{
						fontSize: "1.5rem",
						fontWeight: "700",
						marginBottom: "1rem",
						color: "#93c5fd",
					}}
				>
					🎯 주요 기능
				</h2>
				<ul
					style={{
						lineHeight: "1.9rem",
						fontSize: "1.05rem",
						paddingLeft: "1.2rem",
						color: "#e2e8f0",
					}}
				>
					<li>
						✅ <b>포트폴리오 관리</b>: 자산 등록, 리밸런싱, 통합 리포트
					</li>
					<li>
						✅ <b>실시간 주식 대시보드</b>: 종목 검색, 시세 조회, 빠른 대응
					</li>
					<li>
						✅ <b>AI 어시스턴트</b>: 맞춤형 인사이트 및 위험 감지
					</li>
				</ul>
			</section>

			<section style={sectionCardStyle}>
				<h2
					style={{
						fontSize: "1.5rem",
						fontWeight: "700",
						marginBottom: "1rem",
						color: "#93c5fd",
					}}
				>
					🧠 투자자 의사결정 지원 AI 에이전트
				</h2>
				<p
					style={{
						lineHeight: "1.9rem",
						fontSize: "1.05rem",
						color: "#e2e8f0",
					}}
				>
					투자자 개인의 정보 비대칭성과 복잡성을 해소하고, <br />
					주식, 채권, 펀드 등 다양한 금융자산의 데이터 및 국내외 뉴스를 분석해{" "}
					<b>맞춤형 전략</b>을 제공합니다. <br />
					또한 <b>자동 리포트 생성</b>, <b>위험 신호 감지</b>,{" "}
					<b>포트폴리오 리밸런싱</b> 제안 등을 통해 효율적인 의사결정을
					지원합니다.
				</p>
			</section>

			<section style={sectionCardStyle}>
				<h2
					style={{
						fontSize: "1.5rem",
						fontWeight: "700",
						marginBottom: "1rem",
						color: "#93c5fd",
					}}
				>
					👨‍💻 개발자 정보
				</h2>
				<p
					style={{
						lineHeight: "1.9rem",
						fontSize: "1.05rem",
						color: "#e2e8f0",
					}}
				>
					이 플랫폼은 <b>React</b>, <b>FastAPI</b>, <b>MongoDB</b> 기반으로
					개발되었으며,
					<br />
					Frontend, Backend, AI 기능 모두 직접 설계 및 구현하였습니다.
					<br />
					<b style={{ color: "#facc15" }}>Team 피카츄⚡</b>의 열정으로 최고의
					사용자 경험을 목표로 지속 개선 중입니다.
				</p>
			</section>

			<section style={sectionCardStyle}>
				<h2
					style={{
						fontSize: "1.5rem",
						fontWeight: "700",
						marginBottom: "1rem",
						color: "#93c5fd",
					}}
				>
					💬 의견 보내기
				</h2>
				<p
					style={{
						lineHeight: "1.8rem",
						fontSize: "1.05rem",
						color: "#e2e8f0",
						marginBottom: "1rem",
					}}
				>
					더 나은 서비스를 위한 의견이나 문의사항이 있다면 자유롭게
					작성해주세요.
				</p>
				<textarea
					value={feedback}
					onChange={(e) => setFeedback(e.target.value)}
					placeholder="예: 종목 검색 속도가 느려요, 새로운 기능 제안 등"
					style={{
						width: "100%",
						maxWidth: "100%",
						boxSizing: "border-box",
						minHeight: "120px",
						borderRadius: "0.75rem",
						padding: "1rem",
						backgroundColor: "#0f172a",
						border: "1px solid #334155",
						color: "#f1f5f9",
						fontSize: "1rem",
						fontFamily: "'Inter', sans-serif",
						resize: "vertical",
					}}
				/>
				<div style={{ display: "flex", justifyContent: "center" }}>
					<button
						disabled={loading}
						style={{
							marginTop: "1rem",
							backgroundColor: "#3b82f6",
							border: "none",
							borderRadius: "0.5rem",
							padding: "0.6rem 1.2rem",
							color: "white",
							fontSize: "1rem",
							cursor: "pointer",
							transition: "background-color 0.3s",
						}}
						onClick={sendFeedback}
					>
						의견 보내기
					</button>
				</div>
			</section>
		</div>
	);
};

export default About;
