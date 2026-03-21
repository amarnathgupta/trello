import "dotenv/config.js";
import express from "express";
import { router } from "./routes/index.js";

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

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
// cards.json        → { id, title, listId, order }
