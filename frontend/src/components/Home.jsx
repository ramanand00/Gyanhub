import { useEffect, useState } from "react";
import API from "../services/api";

const Home = () => {
  const [message, setMessage] = useState("Loading...");
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await API.get("/api/Health");

        setMessage(res.data.message);
        setStatus(res.data.success);
      } catch (error) {
        console.error("Health Check Error:", error);

        setMessage("Backend Connection Failed");
        setStatus(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[500px] rounded-xl bg-white p-10 shadow-lg text-center">
        <h1 className="mb-4 text-4xl font-bold text-blue-600">
          GyanPark
        </h1>

        <div
          className={`rounded-lg p-4 font-semibold text-white ${
            status ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default Home;