import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

export default function Sidebar() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");


    return (
        <div className="w-64 h-screen bg-gray-900 text-white p-5">

            <h2 className="text-2xl font-bold mb-8">Dashboard</h2>

            <ul className="space-y-4">

                {/* 🔥 ADMIN */}
                {role === "admin" && (
                    <>
                        <li onClick={() => navigate("/admin")} className="cursor-pointer">
                            Dashboard
                        </li>

                        <li onClick={() => navigate("/clients")} className="cursor-pointer">
                            Clients
                        </li>

                        <li onClick={() => navigate("/projects")} className="cursor-pointer">
                            Projects
                        </li>

                        <li onClick={() => navigate("/tasks")} className="cursor-pointer">
                            Tasks
                        </li>
                    </>
                )}

                {/* 🔥 MANAGER */}
                {role === "manager" && (
                    <>
                        <li onClick={() => navigate("/manager")} className="cursor-pointer">
                            Manager Panel
                        </li>

                        <li onClick={() => navigate("/projects")} className="cursor-pointer">
                            Projects
                        </li>

                        <li onClick={() => navigate("/tasks")} className="cursor-pointer">
                            Tasks
                        </li>
                    </>
                )}

                {/* 🔥 USER (ONLY THIS 🔥) */}
                {role === "user" && (
                    <>
                        <li onClick={() => navigate("/user")} className="cursor-pointer font-bold text-blue-600">
                            User Home
                        </li>
                    </>
                )}

                {/* 🚪 LOGOUT */}
                <li
                    onClick={() => {
                        localStorage.clear();
                        window.location.href = "/";
                    }}
                    className="text-red-500 cursor-pointer mt-10"
                >
                    Logout
                </li>

            </ul>

        </div>
    );
}