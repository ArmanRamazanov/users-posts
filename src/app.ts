import express from "express";
import dotenv from "dotenv";
import router from "@/routes/index.js";
import { connectToDatabase } from "@/config/databaseConnection.js";
import morgan from "morgan";
import type { Request, Response } from "express";
import { errorHandler } from "@/middleware/globalErrorHandler.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

connectToDatabase((err) => {
  if (!err) {
    app.listen(PORT, () => {
      console.log(`app is running on ${PORT}`);
    });
  }
});

app.use(express.json());
app.use(morgan(":method :url :date[clf]"));
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "Users and Posts api",
    version: "1.0.0",
    links: {
      posts: "api/posts",
    },
  });
});

app.use(errorHandler);
