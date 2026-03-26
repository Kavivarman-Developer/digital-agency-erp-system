import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../components/layout/Layout";
import { fetchMyTasks, completeTask } from "../features/tasksSlice";

export default function User() {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.items);
  const status = useSelector((state) => state.tasks.status);

  useEffect(() => {
    if (status === "idle") dispatch(fetchMyTasks());
  }, [dispatch, status]);

  const handleComplete = (id) => {
    dispatch(completeTask(id));
  };

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned</p>
      ) : (
        <div className="bg-white p-5 rounded-xl shadow">

          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th>Task</th>
                <th>Project</th>
                <th>Assigned Date</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t._id} className="border-b">

                  <td>{t.title}</td>
                  <td>{t.projectId?.name}</td>

                  <td>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </td>

                  <td>{t.deadline?.slice(0, 10)}</td>

                  <td>{t.status}</td>

                  <td>
                    {t.status !== "completed" && (
                      <button
                        onClick={() => handleComplete(t._id)}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </Layout>
  );
}