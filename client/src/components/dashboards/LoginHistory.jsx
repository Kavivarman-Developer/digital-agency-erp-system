import { useEffect, useState } from "react";
import axios from "axios";

export default function LoginHistory() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [search, date, logs]);

  const fetchLogs = async () => {
    const res = await axios.get("http://localhost:5000/api/history", {
      headers: {
        Authorization: localStorage.getItem("token")
      }
    });

    setLogs(res.data);
    setFilteredLogs(res.data);
  };

  // 🔍 Filter logic
  const filterLogs = () => {
    let temp = logs;

    if (search) {
      temp = temp.filter((l) =>
        l.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (date) {
      temp = temp.filter(
        (l) =>
          new Date(l.loginTime).toISOString().slice(0, 10) === date
      );
    }

    setFilteredLogs(temp);
    setCurrentPage(1); // reset page
  };

  // 📄 Pagination logic
  const indexOfLast = currentPage * logsPerPage;
  const indexOfFirst = indexOfLast - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <div className="bg-white p-5 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4">Login History</h2>

      {/* 🔍 Filters */}
      <div className="flex gap-4 mb-4">

        <input
          placeholder="Search email..."
          className="border p-2 rounded w-1/2"
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          onChange={(e) => setDate(e.target.value)}
        />

      </div>

      {/* 📊 Table */}
      <table className="w-full">

        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Email</th>
            <th>Role</th>
            <th>Login Time</th>
          </tr>
        </thead>

        <tbody>
          {currentLogs.map((log, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              <td className="py-2">{log.email}</td>
              <td>{log.role}</td>
              <td>{new Date(log.loginTime).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>

      </table>

      {/* 📄 Pagination */}
      <div className="flex justify-center mt-4 gap-2">

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Prev
        </button>

        <span className="px-3 py-1">
          {currentPage} / {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Next
        </button>

      </div>

    </div>
  );
}