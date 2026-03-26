const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/protected", require("./src/routes/protectedRoutes"));
app.use("/api/history", require("./src/routes/loginHistoryRoutes"));
app.use("/api/clients", require("./src/routes/clientRoutes"));
app.use("/api/projects", require("./src/routes/projectRoutes"));
app.use("/api/tasks", require("./src/routes/taskRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));

app.listen(5000, () => console.log("Server running"));