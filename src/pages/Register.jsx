import React, { useState } from "react";
import { handleRegister } from "../utils/auth";

const Register = () => {
	const [form, setForm] = useState({
		email: "",
		phoneNum: "",
		firstName: "",
		lastName: "",
		userId: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSubmit = (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		handleRegister({
			form,
			onSuccess: () => {
				setSuccess("회원가입이 완료되었습니다! 로그인 페이지로 이동해주세요.");
			},
			onError: (msg) => {
				setError(msg);
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
					window.history.back();
				}}
			>
				arrow_back
			</span>

			<div
				style={{
					backgroundColor: "rgba(255, 255, 255, 0.03)",
					padding: "2.5rem",
					borderRadius: "1rem",
					boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
					width: "100%",
					maxWidth: "460px",
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
						app_registration
					</span>
					회원가입
				</h2>

				<form
					onSubmit={onSubmit}
					style={{ display: "flex", flexDirection: "column" }}
				>
					{[
						{ name: "email", placeholder: "이메일", type: "email" },
						{
							name: "phoneNum",
							placeholder: "전화번호 ( ' - ' 없이 숫자만 입력 )",
							type: "text",
						},
						{ name: "firstName", placeholder: "이름", type: "text" },
						{ name: "lastName", placeholder: "성", type: "text" },
						{ name: "userId", placeholder: "아이디", type: "text" },
						{ name: "password", placeholder: "비밀번호", type: "password" },
					].map(({ name, placeholder, type }) => (
						<input
							key={name}
							name={name}
							type={type}
							placeholder={placeholder}
							value={form[name]}
							onChange={handleChange}
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
					))}

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
						회원가입
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

					{success && (
						<p
							style={{
								color: "#34d399",
								marginTop: "1rem",
								textAlign: "center",
							}}
						>
							{success}
						</p>
					)}
				</form>
			</div>
		</div>
	);
};

export default Register;
