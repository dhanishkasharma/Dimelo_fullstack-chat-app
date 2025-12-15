import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import {connectDB} from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import {app,server} from "./lib/socket.js";
dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname=path.resolve();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors(
    {
         origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
));


app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);



server.listen(PORT, () => {
  console.log("server is running on port " + PORT);
  connectDB();
});
export default app;
