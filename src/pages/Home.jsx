import React, { useState } from "react";
import Header from "../components/Header";
import StockDashboard from "../components/StockDashboard";
import PortfolioDashboard from "../components/PortfolioDashboard";

const styles = {
	container: {
		color: "white",
		paddingTop: "1rem",
		textAlign: "center",
		minHeight: "100vh",
	},
};

const Home = () => {
	const [activeTab, setActiveTab] = useState("stock");
	return (
		<div style={styles.container}>
			<Header activeTab={activeTab} setActiveTab={setActiveTab} />
			{activeTab === "stock" && <StockDashboard />}
			{activeTab === "portfolio" && <PortfolioDashboard />}
		</div>
	);
};

export default Home;
