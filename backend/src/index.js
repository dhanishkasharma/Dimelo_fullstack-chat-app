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
        origin: ["http://localhost:5173", "http://localhost:5177"],
        credentials: true// Allow cookies to be sent with requests
    }
))


app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist")));
   app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
   });


}



server.listen(PORT, () => {
  console.log("server is running on port " + PORT);
  connectDB();
});
export default app;