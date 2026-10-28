import express from "express";
import { config } from "./config/config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { router as UserRouter } from "./routes/users.router.js";
import { router as TicketRouter } from "./routes/tickets.router.js";
import { router as ReplyRouter } from "./routes/replies.router.js";
import { router as OfficeRouter } from "./routes/offices.router.js";
import { router as CategoryRouter } from "./routes/categories.router.js";
import { router as AreaRouter } from "./routes/areas.router.js";
import { router as AttachmentRouter } from "./routes/attachments.router.js";

const app = express();
//credentials: true para que el frontend pueda mandar y recibir las cookies del login
app.use(cors({ origin: config.frontend_url, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookie_secret));

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/user", UserRouter);
app.use("/api/ticket/:id/replies", ReplyRouter);
app.use("/api/ticket/:id/attachments", AttachmentRouter);
app.use("/api/ticket", TicketRouter);
app.use("/api/office", OfficeRouter);
app.use("/api/category", CategoryRouter);
app.use("/api/area", AreaRouter);

app.listen(config.port, () => {
  console.log(`Server corriendo en PORT: ${config.port}`);
});
