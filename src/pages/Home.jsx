import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import StockDashboard from "../components/StockDashboard";
import PortfolioDashboard from "../components/PortfolioDashboard";
import AIAssistantDashboard from "../components/AIAssistantDashboard";

const styles = {
	container: {
		color: "white",
		// paddingTop: "1rem",
		margin: 0,
		padding: 0,
		textAlign: "center",
		minHeight: "100vh",
	},
};

const Home = () => {
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const initialTab = params.get("tab") || "stock";
	const [activeTab, setActiveTab] = useState(initialTab);
	return (
		<div style={styles.container}>
			<Header activeTab={activeTab} setActiveTab={setActiveTab} />
			{activeTab === "stock" && <StockDashboard />}
			{activeTab === "portfolio" && (
				<PortfolioDashboard setActiveTab={setActiveTab} />
			)}
			{activeTab === "assistant" && <AIAssistantDashboard />}
		</div>
	);
};

export default Home;
