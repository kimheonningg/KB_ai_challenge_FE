import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import Register from "./pages/Register";
import AddPortfolio from "./pages/AddPortfolio";
import Reports from "./pages/Reports";
import "./App.css";

const App = () => (
	<Router>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/about" element={<About />} />
			<Route path="/login" element={<Login />} />
			<Route path="/user_profile" element={<UserProfile />} />
			<Route path="/register" element={<Register />} />
			<Route path="/add_portfolio" element={<AddPortfolio />} />
			<Route path="/create_report" element={<Reports />} />
		</Routes>
	</Router>
);

export default App;
