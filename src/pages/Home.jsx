import React, { useState } from "react";
import Header from "../components/Header";
import FeatureTabs from "../components/FeatureTabs";
import StockDashboard from "../components/StockDashboard";

const styles = {
	container: {
		background: "linear-gradient(to bottom, #0d1a33, #1a2b4d)",
		color: "white",
		padding: "2rem",
		textAlign: "center",
		minHeight: "100vh",
	},
};

const Home = () => {
	const [activeTab, setActiveTab] = useState("stock");
	return (
		<div style={styles.container}>
			<Header />
			<FeatureTabs activeTab={activeTab} setActiveTab={setActiveTab} />
			{activeTab === "stock" && <StockDashboard />}
		</div>
	);
};

export default Home;
