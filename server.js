require("dotenv").config();
require("module-alias/register");

const cors = require("cors");
const express = require("express");
const responseMiddleware = require("@/middlewares/response");
const appRoute = require("@/routes/index");
const startQueueWorker = require("./queue-worker");
const startSchedule = require("./schedule");

const app = express();
const port = 3000;

const corsOptions = {
  origin: ["http://localhost:5173", "https://hohuynhtrung.github.io"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseMiddleware);

app.use("/api", appRoute);

app.get("/", (req, res) => {
  res.send({ message: "Node day 7" });
});

app.listen(port, () => {
  console.log("Running on http://localhost:" + port);
  startQueueWorker();
  startSchedule();
});
