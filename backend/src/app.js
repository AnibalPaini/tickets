import express from "express";
import { config } from "./config/config.js";
import cookieParser from "cookie-parser";
import { router as UserRouter } from "./routes/users.router.js";
import { router as TicketRouter } from "./routes/tickets.router.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(config.cookie_secret));

app.get("/ping", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/user", UserRouter);
app.use("/api/ticket", TicketRouter);

app.listen(config.port, () => {
  console.log(`Server corriendo en PORT: ${config.port}`);
});
