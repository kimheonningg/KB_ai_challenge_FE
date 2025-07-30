import React, { useState } from "react";
import Header from "../components/Header";
import StockDashboard from "../components/StockDashboard";

const styles = {
	container: {
		color: "white",
		paddingTop: "1rem",
		textAlign: "center",
		minHeight: "100vh",
	},
};

const Home = () => {
	const [activeTab, setActiveTab] = useState("portfolio");
	return (
		<div style={styles.container}>
			<Header activeTab={activeTab} setActiveTab={setActiveTab} />
			{activeTab === "stock" && <StockDashboard />}
		</div>
	);
};

export default Home;
