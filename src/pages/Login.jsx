import React, { useState } from "react";
import { handleLogin } from "../utils/auth";

const Login = () => {
	const [userId, setUserId] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const onSubmit = (e) => {
		e.preventDefault();
		handleLogin({
			userId,
			password,
			onSuccess: () => {
				window.location.href = "/";
			},
			onError: (errMsg) => {
				setError(errMsg);
			},
		});
	};

	return (
		<div
			style={{
				background: "linear-gradient(to bottom, #1e293b, #0f172a)",
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				fontFamily: "'Inter', sans-serif",
				padding: "2rem",
			}}
		>
			<div
				style={{
					backgroundColor: "rgba(255, 255, 255, 0.03)",
					padding: "2.5rem",
					borderRadius: "1rem",
					boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
					width: "100%",
					maxWidth: "420px",
					border: "1px solid rgba(255,255,255,0.07)",
				}}
			>
				<h2
					style={{
						textAlign: "center",
						color: "#e2e8f0",
						fontSize: "1.7rem",
						fontWeight: "700",
						marginBottom: "2rem",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "0.5rem",
					}}
				>
					<span className="material-icons" style={{ fontSize: "2rem" }}>
						person
					</span>
					로그인
				</h2>

				<form
					onSubmit={onSubmit}
					style={{ display: "flex", flexDirection: "column" }}
				>
					<input
						type="text"
						placeholder="아이디"
						value={userId}
						onChange={(e) => setUserId(e.target.value)}
						required
						style={{
							marginBottom: "1rem",
							padding: "0.85rem 1rem",
							borderRadius: "0.5rem",
							border: "1px solid #334155",
							backgroundColor: "#0f172a",
							color: "#f1f5f9",
							fontSize: "1rem",
						}}
					/>
					<input
						type="password"
						placeholder="비밀번호"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						style={{
							marginBottom: "1.5rem",
							padding: "0.85rem 1rem",
							borderRadius: "0.5rem",
							border: "1px solid #334155",
							backgroundColor: "#0f172a",
							color: "#f1f5f9",
							fontSize: "1rem",
						}}
					/>
					<button
						type="submit"
						style={{
							background: "linear-gradient(to right, #6366f1, #3b82f6)",
							border: "none",
							borderRadius: "0.5rem",
							padding: "0.8rem",
							color: "white",
							fontSize: "1.05rem",
							cursor: "pointer",
							fontWeight: "600",
							boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
						}}
					>
						로그인
					</button>
					{error && (
						<p
							style={{
								color: "#f87171",
								marginTop: "1rem",
								textAlign: "center",
							}}
						>
							{error}
						</p>
					)}
				</form>
			</div>
		</div>
	);
};

export default Login;
