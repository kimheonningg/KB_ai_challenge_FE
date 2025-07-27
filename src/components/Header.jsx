import React from "react";

const styles = {
	header: {
		marginBottom: "2rem",
		fontFamily: "'Inter', sans-serif",
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
		fontFamily: "'Inter', sans-serif",
	},
};

const Header = () => {
	return (
		<div style={styles.header}>
			{/* <img src="/public/KB_logo.jpg" alt="KB Logo" style={styles.logo} /> */}
			<h1 style={styles.title}>AI 기반 주식 분석 플랫폼</h1>
			<p style={styles.subtitle}>
				KB Future Finance A.I. Challenge
				<span style={styles.team}>Team 피카츄⚡</span>
			</p>
		</div>
	);
};

export default Header;
