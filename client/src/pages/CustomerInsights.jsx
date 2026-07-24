import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCustomerInterests, clearInterests } from "../features/customerInterestSlice";
import API from "../api/axios";
import Layout from "../components/layout/Layout";

export default function CustomerInsights() {
  const dispatch = useDispatch();
  const { topCategories, topProducts, loading, error } = useSelector((s) => s.customerInterest);

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    let active = true;

    const loadCustomers = async () => {
      setCustomersLoading(true);
      setCustomersError("");
      try {
        const res = await API.get("/customers");
        if (!active) return;
        setCustomers(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!active) return;
        setCustomers([]);
        setCustomersError(err.response?.data?.error || "Customers load aagala. Backend/API check pannunga.");
      } finally {
        if (active) setCustomersLoading(false);
      }
    };

    loadCustomers();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedCustomer) {
      dispatch(clearInterests());
      return;
    }
    dispatch(fetchCustomerInterests(selectedCustomer));
    return () => dispatch(clearInterests());
  }, [selectedCustomer, dispatch]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Analytics</p>
          <h1 className="text-2xl font-bold text-slate-800">Customer Insights</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Select Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            disabled={customersLoading || customers.length === 0}
            className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">
              {customersLoading ? "Loading customers..." : "-- Select Customer --"}
            </option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.email})
              </option>
            ))}
          </select>

          {customersError && <p className="mt-3 text-sm text-red-600">{customersError}</p>}
          {!customersLoading && !customersError && customers.length === 0 && (
            <p className="mt-3 text-sm text-slate-500">Customer role users illa. Customer account register pannunga.</p>
          )}
        </div>

        {loading && <p className="text-sm text-slate-500">Loading insights...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {selectedCustomer && !loading && !error && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">Most Searched Categories</h3>
              {topCategories.length === 0 ? (
                <p className="text-sm text-slate-400">No activity yet</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topCategories.map((cat) => (
                    <span key={cat._id || "uncategorized"} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                      {cat._id || "Uncategorized"} ({cat.count})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-slate-800">Most Viewed Products</h3>
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-400">No activity yet</p>
              ) : (
                <ul className="space-y-2">
                  {topProducts.map((item) => (
                    <li key={item._id} className="flex justify-between border-b border-slate-100 pb-2 text-sm">
                      <span className="font-medium text-slate-700">{item.productDetails[0]?.name || "Unknown"}</span>
                      <span className="text-slate-500">{item.count} views</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
