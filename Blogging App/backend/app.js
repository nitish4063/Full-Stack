import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import { dbConnection } from "./database/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";

import userRouter from "./routes/userRouter.js";
import blogRouter from "./routes/blogRouter.js";

const app = express();
config({ path: "./config/config.env" });

// MIDDLEWARES
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ROUTES
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);

// Database Connection
dbConnection();

// ERROR MIDDLEWARE
app.use(errorMiddleware);

export default app;
