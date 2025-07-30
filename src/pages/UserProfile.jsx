import React, { useEffect, useState } from "react";
import { fetchUserProfile } from "../utils/auth";
import { handleLogout } from "../utils/auth";

const sectionCardStyle = {
	backgroundColor: "rgba(255, 255, 255, 0.05)",
	borderRadius: "1rem",
	padding: "1.5rem 2rem",
	boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
	marginBottom: "2rem",
	border: "1px solid rgba(255,255,255,0.08)",
};

const labelStyle = {
	color: "#93c5fd",
	fontWeight: "600",
	fontSize: "0.95rem",
	marginBottom: "0.2rem",
};

const valueStyle = {
	color: "#f1f5f9",
	fontSize: "1.05rem",
	marginBottom: "1.2rem",
};

const UserProfile = () => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await fetchUserProfile();
				setUser(userData);
			} catch (err) {
				console.error("사용자 정보 로드 실패:", err);
			}
		};
		loadUser();
	}, []);

	if (!user) {
		return (
			<div
				style={{
					padding: "3rem 5vw",
					color: "#f8fafc",
					background: "linear-gradient(to bottom, #1e293b, #0f172a)",
					minHeight: "100vh",
					fontFamily: "'Inter', sans-serif",
				}}
			>
				로딩 중...
			</div>
		);
	}

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
					👤 내 정보
				</h1>
				<p
					style={{
						fontSize: "1.15rem",
						color: "#cbd5e1",
						maxWidth: "760px",
						margin: "0 auto",
					}}
				>
					회원 가입 시 입력한 정보를 확인할 수 있어요.
				</p>
			</header>

			<section style={sectionCardStyle}>
				<div>
					<div style={labelStyle}>이메일</div>
					<div style={valueStyle}>{user.email}</div>

					<div style={labelStyle}>전화번호</div>
					<div style={valueStyle}>{user.phoneNum}</div>

					<div style={labelStyle}>이름</div>
					<div style={valueStyle}>
						{user.firstName} {user.lastName}
					</div>

					<div style={labelStyle}>아이디</div>
					<div style={valueStyle}>{user.userId}</div>

					<div style={labelStyle}>가입일</div>
					<div style={valueStyle}>
						{new Date(user.createdAt).toLocaleString()}
					</div>
				</div>
			</section>

			<div style={{ textAlign: "center" }}>
				<button
					onClick={handleLogout}
					style={{
						backgroundColor: "#ef4444",
						border: "none",
						borderRadius: "0.5rem",
						padding: "0.6rem 1.2rem",
						color: "white",
						fontSize: "1rem",
						cursor: "pointer",
						transition: "background-color 0.3s",
					}}
				>
					로그아웃
				</button>
			</div>
		</div>
	);
};

export default UserProfile;
