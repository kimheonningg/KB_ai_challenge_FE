import React from "react";

const LoginRequired = ({ onLogin }) => {
	const goLogin = () => {
		if (typeof onLogin === "function") onLogin();
		else window.location.assign("/login");
	};

	const wrapperStyle = {
		padding: "1rem 2rem",
		background:
			"linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
		minHeight: "calc(100vh - 80px)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
		color: "#e2e8f0",
	};

	const cardStyle = {
		width: "100%",
		maxWidth: 520,
		padding: "2rem",
		borderRadius: 20,
		border: "1px solid rgba(148,163,184,0.2)",
		background:
			"linear-gradient(135deg, rgba(15,23,42,0.7) 0%, rgba(30,41,59,0.7) 100%)",
		boxShadow:
			"0 20px 40px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
		backdropFilter: "blur(10px)",
		textAlign: "center",
		animation: "rl-fade-in 400ms ease-out",
	};

	const iconWrap = {
		width: 64,
		height: 64,
		borderRadius: 16,
		margin: "0 auto 1rem",
		display: "grid",
		placeItems: "center",
		background:
			"linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)",
		border: "1px solid rgba(59,130,246,0.35)",
	};

	const titleStyle = {
		fontSize: "1.35rem",
		fontWeight: 800,
		letterSpacing: "0.01em",
		color: "#f1f5f9",
		marginTop: "0.25rem",
	};

	const descStyle = {
		fontSize: "0.98rem",
		color: "#94a3b8",
		marginTop: "0.5rem",
		lineHeight: 1.6,
	};

	const ctaStyle = {
		display: "inline-flex",
		alignItems: "center",
		gap: "0.5rem",
		marginTop: "1.25rem",
		padding: "0.85rem 1.25rem",
		borderRadius: 14,
		border: "1px solid rgba(59,130,246,0.45)",
		background:
			"linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(139,92,246,0.25) 100%)",
		color: "#e2e8f0",
		fontWeight: 700,
		cursor: "pointer",
		userSelect: "none",
		transition:
			"transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
		boxShadow:
			"0 10px 18px -10px rgba(59,130,246,0.35), 0 6px 12px -8px rgba(139,92,246,0.28)",
		width: "200px",
	};

	const linkStyle = {
		display: "inline-block",
		marginTop: 20,
		color: "#93c5fd",
		fontSize: "0.9rem",
		textDecoration: "underline",
		textUnderlineOffset: 4,
		cursor: "pointer",
		transition: "opacity 150ms ease",
	};

	return (
		<div style={wrapperStyle}>
			<div
				style={cardStyle}
				role="dialog"
				aria-labelledby="rl-title"
				aria-describedby="rl-desc"
			>
				<div style={iconWrap} aria-hidden="true">
					<span
						className="material-icons"
						style={{ fontSize: 28, color: "#60a5fa" }}
					>
						lock
					</span>
				</div>

				<h1 id="rl-title" style={titleStyle}>
					로그인이 필요한 서비스입니다
				</h1>
				<p id="rl-desc" style={descStyle}>
					개인화된 포트폴리오와 즐겨찾기 종목을 보려면 먼저 로그인해주세요.
				</p>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<button
						style={ctaStyle}
						onClick={goLogin}
						onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && goLogin()}
						onMouseEnter={(e) => {
							e.currentTarget.style.transform = "translateY(-2px)";
							e.currentTarget.style.boxShadow =
								"0 18px 30px -14px rgba(59,130,246,0.45), 0 10px 18px -12px rgba(139,92,246,0.35)";
							e.currentTarget.style.borderColor = "rgba(59,130,246,0.7)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.transform = "translateY(0)";
							e.currentTarget.style.boxShadow =
								"0 10px 18px -10px rgba(59,130,246,0.35), 0 6px 12px -8px rgba(139,92,246,0.28)";
							e.currentTarget.style.borderColor = "rgba(59,130,246,0.45)";
						}}
					>
						<span className="material-icons" style={{ fontSize: 18 }}>
							login
						</span>
						로그인하러 가기
					</button>

					<span
						style={linkStyle}
						onClick={() => window.location.assign("/")}
						onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.85)}
						onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
					>
						홈으로 돌아가기
					</span>
				</div>
			</div>

			{/* keyframes (inline) */}
			<style>{`
        @keyframes rl-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
		</div>
	);
};

export default LoginRequired;
