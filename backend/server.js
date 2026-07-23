import "dotenv/config"; // ← MUST be first, before all other imports
import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import sendWhatsAppMessage from "./src/services/whatsappService.js";
import authRoutes from "./src/routes/authRoutes.js";
import protectedRoutes from "./src/routes/protectedRoutes.js";
import loginHistoryRoutes from "./src/routes/loginHistoryRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import projectRoutes from "./src/routes/projectRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import leaveRouter from "./src/routes/leaveRouter.js";
import productRoutes from "./src/routes/Productroutes.js";
import orderRoutes from "./src/routes/Orderroutes.js";
import uploadRoute from "./src/routes/uploadRoute.js";
import advertisementRoutes from "./src/routes/advertisementRoutes.js";


const port = process.env.PORT ?? 5000;
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// Existing routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/history", loginHistoryRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRouter);
app.use("/api/leave", leaveRouter);

// New routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoute);

// Advertisement routes (both public and admin)
app.use("/api/advertisements", advertisementRoutes);


app.get("/test-whatsapp", async (req, res) => {
  await sendWhatsAppMessage(
    "+919943958576",
    "Test message from my project 🚀"
  );
  res.send("Message sent");
});

app.listen(port, () => console.log(`Server connected on the port ${port}`));