const express = require("express");
const dotenv = require("dotenv").config();;
const cors = require("cors");
const connectDB = require("./src/config/db");
const sendWhatsAppMessage = require("./src/services/whatsappService");

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
app.use("/api/leaves", require("./src/routes/leaveRouter"));
app.use("/api/leave", require("./src/routes/leaveRouter"));


app.get("/test-whatsapp", async (req, res) => {
  await sendWhatsAppMessage(
    "+919943958576",
    "Test message from my project 🚀"
  );

  res.send("Message sent");
});

app.listen(5000, () => console.log("Server running"));