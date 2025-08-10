import axios from "axios";
import { BASE_URL } from "../const";

// POST /stock-simulation/generate-and-simulate
export const generateAndSimulate = async ({ body, simulation_days, confidence_level }) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("로그인이 필요한 서비스입니다.");

  const res = await axios.post(
    `${BASE_URL}/stock-simulation/generate-and-simulate`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      params: {
        simulation_days,
        confidence_level,
      },
    }
  );
  return res.data; // PortfolioSimulationResponse
};

// GET /stock-simulation/history
export const fetchSimulationHistory = async () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("로그인이 필요한 서비스입니다.");

  const res = await axios.get(`${BASE_URL}/stock-simulation/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // SimulationHistoryResponse
};

// DELETE /stock-simulation/{simulation_id}
export const deleteSimulation = async (simulationId) => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("로그인이 필요한 서비스입니다.");

  const res = await axios.delete(`${BASE_URL}/stock-simulation/${simulationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // { success: true }
};

