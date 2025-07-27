import React from "react";
import StockDashboard from "../components/StockDashboard";

const styles = {
	container: {
		background: "linear-gradient(to bottom, #0d1a33, #1a2b4d)",
		color: "white",
		padding: "2rem",
		textAlign: "center",
		minHeight: "100vh",
	},
	header: {
		marginBottom: "2rem",
	},
	logo: {
		width: "50px",
		marginBottom: "1rem",
	},
	title: {
		fontSize: "2rem",
		margin: 0,
	},
	team: {
		backgroundColor: "#1e90ff",
		color: "white",
		padding: "0.3em 0.6em",
		borderRadius: "10px",
		marginLeft: "0.5em",
		fontSize: "0.9rem",
	},
	subtitle: {
		margin: "0.5em 0 2em",
		fontSize: "1rem",
		color: "#ccc",
	},
	featureTags: {
		marginTop: "1rem",
		display: "flex",
		justifyContent: "center",
		gap: "1rem",
		fontSize: "0.9rem",
		flexWrap: "wrap",
	},
	tag: {
		background: "rgba(255, 255, 255, 0.1)",
		padding: "0.3em 0.8em",
		borderRadius: "10px",
	},
};

const Home = () => {
	return (
		<div style={styles.container}>
			<div style={styles.header}>
				{/* <img src="/logo.png" alt="KB Logo" style={styles.logo} /> */}
				<h1 style={styles.title}>
					KB Future Finance A.I. Challenge
					<span style={styles.team}>Team 피카츄⚡</span>
				</h1>
				<p style={styles.subtitle}>AI 기반 주식 분석 플랫폼</p>
			</div>

			<div style={styles.featureTags}>
				<span style={styles.tag}>🟢 실시간 뉴스 분석</span>
				<span style={styles.tag}>🟣 재무제표 분석</span>
				<span style={styles.tag}>⚡ 뉴스와 재무제표 통합 분석</span>
			</div>
			<StockDashboard />
		</div>
	);
};

export default Home;
