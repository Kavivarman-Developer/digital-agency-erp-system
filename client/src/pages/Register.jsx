import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const navigate = useNavigate();

  const register = async () => {
    if (!name || !email || !password) {
      alert("All fields required");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role
      });

      alert("Registered successfully");

      // 👉 after register go to login
      navigate("/");

    } catch (err) {
      alert(err.response?.data || "Error");
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE (same as login) */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12">

        <div>
          <h1 className="text-5xl font-bold mb-6">
            Join Us 🚀
          </h1>

          <p className="text-lg mb-6">
            Create your account and access the role-based system.
          </p>

          <ul className="space-y-3 text-lg">
            <li>🔐 Secure Authentication</li>
            <li>👥 Multiple Roles</li>
            <li>📊 Activity Tracking</li>
            <li>⚡ Fast & Easy Access</li>
          </ul>

          <p className="mt-10 text-sm opacity-80">
            Start your journey with our platform.
          </p>
        </div>

      </div>

      {/* RIGHT SIDE (Glass Form) */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100">

        <div className="bg-white/70 backdrop-blur-lg shadow-xl rounded-2xl p-10 w-96 border">

          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
            Register
          </h2>

          <input
            placeholder="Name"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Role Dropdown */}
          <select
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button
            onClick={register}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
          >
            Register
          </button>

          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-blue-600 cursor-pointer font-medium"
            >
              Login
            </span>
          </p>

        </div>
      </div>
    </div>
  );
}