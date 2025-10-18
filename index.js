import express from "express";
import cors from "cors";

import personal from "./routes/personal.js";
import work from "./routes/work.js";
import favorites from "./routes/favorites.js";
import archived from "./routes/archived.js";
import trash from "./routes/trash.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/personal", personal);
app.use("/api/work", work);
app.use("/api/favorites", favorites);
app.use("/api/archived", archived);
app.use("/api/trash", trash);

app.listen(4000, () => console.log("Server is running."));
