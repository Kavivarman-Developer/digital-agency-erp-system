import Sidebar from "../dashboards/Sidebar";
import Navbar from "../navbar/Navbar";

export default function Layout({ children }) {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <div className="p-6">
          {children}
        </div>

      </div>
    </div>
  );
}