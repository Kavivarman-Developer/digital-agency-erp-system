import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../utils/auth";
import { useState } from "react";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const role = localStorage.getItem("role");

    const getClass = (path) => `
      cursor-pointer 
      ${location.pathname === path ?
            "font-bold text-blue-600 bg-gray-800 p-2 rounded"
            : "hover:bg-gray-700 p-2 rounded"}
    `;
    const menuItems = [
        { label: "Dashboard", path: "/admin" },
        { label: "Clients", path: "/clients" },
        { label: "Projects", path: "/projects" },
        { label: "Tasks", path: "/tasks" },
        { label: "Leaves", path: "/leaves" },
    ];

    return (
        <div className="w-64 h-screen bg-gray-900 text-white p-5">

            <h2 className="text-2xl font-bold mb-8">Dashboard</h2>

            <ul className="space-y-4">

                {/* 🔥 ADMIN */}
                {role === "admin" && menuItems.map((item) => (
                    <li
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={getClass(item.path)}
                    >
                        {item.label}
                    </li>
                ))}

                {/* 🔥 MANAGER */}
                {role === "manager" && (
                    <>
                        <li onClick={() => navigate("/manager")} className={getClass("/manager")}>
                            Manager Panel
                        </li>

                        <li onClick={() => navigate("/projects")} className={getClass("/projects")}>
                            Projects
                        </li>

                        <li onClick={() => navigate("/tasks")} className={getClass("/tasks")}>
                            Tasks
                        </li>

                         <li onClick={() => navigate("/leaves")} className={getClass("/leaves")}>
                            Leaves
                        </li>
                    </>
                )}

                {/* 🔥 USER (ONLY THIS 🔥) */}
                {role === "user" && (
                    <>
                        <li onClick={() => navigate("/user")} className={getClass("/user")}>
                            User Home
                        </li>
                    </>
                )}

                {/* 🚪 LOGOUT */}
                <li
                    onClick={() => {
                        logout();
                    }}
                    className="text-red-500 cursor-pointer mt-10"
                >
                    Logout
                </li>

            </ul>

        </div>
    );
}