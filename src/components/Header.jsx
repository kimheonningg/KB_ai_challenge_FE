import React from "react";
import FeatureTabs from "./FeatureTabs";

const styles = {
	header: {
		position: "relative",
		background: "linear-gradient(to right, #0d1a33, #1a2b4d)",
		paddingTop: "2rem",
		paddingBottom: "1px",
		textAlign: "center",
		boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
		fontFamily: "'Inter', sans-serif",
	},
	title: {
		fontSize: "1.8rem",
		color: "#ffffff",
		margin: "0",
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: "1rem",
		color: "#aaa",
		marginTop: "0.5rem",
	},
	teamBadge: {
		backgroundColor: "#5c6bc0",
		borderRadius: "12px",
		padding: "0.2em 0.6em",
		color: "#fff",
		fontSize: "0.85rem",
		marginLeft: "0.5rem",
	},
	iconContainer: {
		position: "absolute",
		top: "1rem",
		right: "1.5rem",
		display: "flex",
		gap: "0.3rem",
	},
	icon: {
		cursor: "pointer",
		color: "white",
		fontSize: "1.9rem",
		transition: "transform 0.2s",
	},
};

const Header = ({ activeTab, setActiveTab }) => (
	<div style={styles.header}>
		<div style={styles.iconContainer}>
			<span
				className="material-icons"
				style={styles.icon}
				onClick={() => {
					const isLoggedIn = localStorage.getItem("authToken");
					if (!isLoggedIn) {
						window.location.href = "/login"; // TODO
					} else {
						// TODO
					}
				}}
			>
				account_circle
			</span>
			<span
				className="material-icons"
				style={styles.icon}
				onClick={() => {
					window.location.href = "/about";
				}}
			>
				info
			</span>
		</div>

		<h1 style={styles.title}>AI 기반 주식 분석 플랫폼</h1>
		<p style={styles.subtitle}>
			KB Future Finance A.I. Challenge
			<span style={styles.teamBadge}>Team 피카츄⚡</span>
		</p>
		<FeatureTabs activeTab={activeTab} setActiveTab={setActiveTab} />
	</div>
);

export default Header;
