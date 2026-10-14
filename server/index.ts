import path from "node:path";

import express from "express";
import cors from "cors";
import { Pool } from "pg";

import { createCoreRouter } from "./routes/coreRoutes";
import { createOperationsRouter } from "./routes/operationsRoutes";
import { createAdminRouter } from "./routes/adminRoutes";
import { startSignOnScheduler } from "./services/signOnScheduler";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cors());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
	connectionString: databaseUrl,
});

app.use(createCoreRouter(pool));
app.use(createOperationsRouter(pool));
app.use(createAdminRouter(pool));

const distPath = path.resolve(process.cwd(), "dist");

app.use(express.static(distPath));

app.use((_req, res) => {
	res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);

	startSignOnScheduler(pool);
});
