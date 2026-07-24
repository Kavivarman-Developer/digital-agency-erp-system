import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerInterests, clearInterests } from "../features/customerInterestSlice";
import API from "../api/axios";

export default function CustomerInsights() {
  const dispatch = useDispatch();
  const { topCategories, topProducts, loading, error } = useSelector((s) => s.customerInterest);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Customers list fetch pannunga (dropdown ku)
  useEffect(() => {
    API.get("/customers") // unga customer list endpoint - confirm pannunga
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedCustomer) return;
    dispatch(fetchCustomerInterests(selectedCustomer));
    return () => dispatch(clearInterests());
  }, [selectedCustomer, dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Customer Insights</h1>

      {/* Customer Select */}
      <select
        value={selectedCustomer || ""}
        onChange={(e) => setSelectedCustomer(e.target.value)}
        className="border rounded-lg px-3 py-2 mb-6 w-full max-w-sm"
      >
        <option value="">-- Select Customer --</option>
        {customers.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name} ({c.email})
          </option>
        ))}
      </select>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {selectedCustomer && !loading && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Most Searched Categories</h3>
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topCategories.map((cat) => (
                  <span key={cat._id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {cat._id} ({cat.count})
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Most Viewed Products</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet</p>
            ) : (
              <ul className="space-y-2">
                {topProducts.map((item) => (
                  <li key={item._id} className="flex justify-between border-b pb-1 text-sm">
                    <span>{item.productDetails[0]?.name || "Unknown"}</span>
                    <span className="text-gray-500">{item.count} views</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}