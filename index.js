import express from "express";
import cors from "cors";
import "dotenv/config.js";

import personal from "./routes/personal.js";
import work from "./routes/work.js";
import favorites from "./routes/favorites.js";
import archived from "./routes/archived.js";
import trash from "./routes/trash.js";

const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN }));

app.use("/api/personal", personal);
app.use("/api/work", work);
app.use("/api/favorites", favorites);
app.use("/api/archived", archived);
app.use("/api/trash", trash);

app.listen(PORT, () =>
  console.log(`Server is running in ${NODE_ENV} mode on port ${PORT}`)
);
