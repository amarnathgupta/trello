import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { router } from "./routes/index.js";
import cookieParser from "cookie-parser";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    status: "Ok",
  });
});

app.use("/api/v1", router);

app.listen(port, () => {
  console.log("Server running at port ", port);
});

// users.json        → { id, username, password, orgId }
// orgs.json         → { id, name, description, type(public/private), members: [{userId, role}] }
// boards.json       → { id, title, orgId }
// lists.json        → { id, title, boardId, order }
// cards.json → { id, title, description, listId, createdAt }
