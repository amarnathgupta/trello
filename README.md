# Trello Clone

A full-stack project management application inspired by Trello, built with vanilla HTML/CSS/JS on the frontend and Node.js + Express on the backend. Uses a file-based JSON database designed with the Repository Pattern, making it straightforward to swap in MongoDB without touching routes or controllers.

---

demo: https://www.loom.com/share/31d3f1e16be049d5abb5dce78f869110

## Tech Stack

- **Frontend** — HTML, Tailwind CSS, Vanilla JavaScript
- **Backend** — Node.js, Express.js
- **Database** — File-based JSON (Repository Pattern)
- **Auth** — JWT + bcrypt

---

## Project Structure

```
trello-app/
├── public/                        # Frontend
│   ├── index.html                 # Sign In / Sign Up
│   ├── dashboard.html             # Organizations list
│   ├── board.html                 # Boards + Member management
│   ├── lists.html                 # Lists + Cards (board view)
│   ├── css/
│   │   └── style.css              # Tailwind output
│   └── js/
│       ├── auth.js                # signup, signin, getMe, logout
│       ├── dashboard.js           # Organization CRUD
│       ├── board.js               # Board + member management
│       ├── lists.js               # Lists, cards, move card
│       └── components/
│           └── navbar.js          # Shared navbar component
│
├── server/
│   ├── index.js                   # Express entry point
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.route.js
│   │   ├── org.routes.js
│   │   ├── board.route.js
│   │   ├── list.route.js
│   │   └── card.route.js
│   ├── controllers/
│   │   ├── index.js
│   │   ├── auth.controller.js
│   │   ├── org.controller.js
│   │   ├── board.controller.js
│   │   ├── list.controller.js
│   │   └── card.controller.js
│   ├── db/
│   │   ├── filedb.js              # Low-level file read/write + write queue
│   │   ├── user.db.js
│   │   ├── org.db.js
│   │   ├── board.db.js
│   │   ├── list.db.js
│   │   └── card.db.js
│   └── middlewares/
│       ├── auth.middleware.js     # JWT verify, orgMember check, requireRole
│       └── list.middleware.js     # checkListExists
│
├── data/                          # JSON files (auto-created on first write)
│   ├── users.json
│   ├── orgs.json
│   ├── boards.json
│   ├── lists.json
│   └── cards.json
│
├── trello-postman.json            # Postman collection
├── .env
├── .gitignore
└── package.json
```

---

## Getting Started

**1. Clone and install dependencies**

```bash
git clone https://github.com/amarnathgupta/trello.git
cd trello
npm install
```

**2. Create a `.env` file in the project root**

```
JWT_SECRET=your_long_random_secret_here
PORT=3000
```

**3. Start the server**

```bash
npm start
```

**4. Open the app**

Navigate to `http://localhost:3000` in your browser.

> If using Tailwind CLI, run the build watcher in a separate terminal:
>
> ```bash
> npx tailwindcss -i ./public/css/input.css -o ./public/css/style.css --watch
> ```

---

## API Reference

### Auth

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/api/v1/auth/signup` | Register a new user            |
| POST   | `/api/v1/auth/signin` | Sign in and receive a JWT      |
| GET    | `/api/v1/auth/me`     | Get current authenticated user |

### Organizations

| Method | Endpoint                              | Auth | Required Role |
| ------ | ------------------------------------- | ---- | ------------- |
| POST   | `/api/v1/orgs`                        | ✅   | Any member    |
| GET    | `/api/v1/orgs`                        | ✅   | Any member    |
| GET    | `/api/v1/orgs/:orgId`                 | ✅   | Org member    |
| PATCH  | `/api/v1/orgs/:orgId`                 | ✅   | Admin         |
| DELETE | `/api/v1/orgs/:orgId`                 | ✅   | Admin         |
| POST   | `/api/v1/orgs/:orgId/members`         | ✅   | Admin         |
| DELETE | `/api/v1/orgs/:orgId/members/:userId` | ✅   | Admin         |

### Boards

| Method | Endpoint                              | Auth | Required Role |
| ------ | ------------------------------------- | ---- | ------------- |
| POST   | `/api/v1/orgs/:orgId/boards`          | ✅   | Admin         |
| GET    | `/api/v1/orgs/:orgId/boards`          | ✅   | Org member    |
| GET    | `/api/v1/orgs/:orgId/boards/:boardId` | ✅   | Org member    |
| PATCH  | `/api/v1/orgs/:orgId/boards/:boardId` | ✅   | Admin         |
| DELETE | `/api/v1/orgs/:orgId/boards/:boardId` | ✅   | Admin         |

### Lists

| Method | Endpoint                                            | Auth | Required Role |
| ------ | --------------------------------------------------- | ---- | ------------- |
| POST   | `/api/v1/orgs/:orgId/boards/:boardId/lists`         | ✅   | Admin         |
| GET    | `/api/v1/orgs/:orgId/boards/:boardId/lists`         | ✅   | Org member    |
| GET    | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId` | ✅   | Org member    |
| PATCH  | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId` | ✅   | Admin         |
| DELETE | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId` | ✅   | Admin         |

### Cards

| Method | Endpoint                                                          | Auth | Required Role |
| ------ | ----------------------------------------------------------------- | ---- | ------------- |
| POST   | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId/cards`         | ✅   | Any member    |
| GET    | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId/cards`         | ✅   | Any member    |
| GET    | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId/cards/:cardId` | ✅   | Any member    |
| PATCH  | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId/cards/:cardId` | ✅   | Any member    |
| DELETE | `/api/v1/orgs/:orgId/boards/:boardId/lists/:listId/cards/:cardId` | ✅   | Any member    |

---

## Architecture

### Repository Pattern

All database interaction is isolated inside `server/db/*.db.js` files. Routes and controllers never access the filesystem directly — they only call methods like `User.create()`, `Org.findById()`, etc.

This means switching to MongoDB only requires replacing the `*.db.js` files. Routes, controllers, and middlewares remain completely unchanged.

```
Routes → Controllers → *.db.js → filedb.js (or mongoDb.js)
```

### Authentication Flow

```
POST /signup  →  validate  →  bcrypt.hash(password)  →  User.create()  →  201
POST /signin  →  User.findByUsername()  →  bcrypt.compare()  →  jwt.sign()  →  token
Protected     →  Authorization: Bearer <token>  →  authMiddleware  →  req.user
```

### Middleware Chain

```
authMiddleware → orgMemberMiddleware → requireRole("admin") → controller
```

- `authMiddleware` — verifies JWT, sets `req.user`
- `orgMemberMiddleware` — confirms the user is a member of the org, sets `req.user.role`
- `requireRole("admin")` — guards routes that require admin privileges

### Write Queue (Concurrency Safety)

`filedb.js` uses a per-file promise queue to serialize concurrent writes. This prevents race conditions where simultaneous requests could corrupt a JSON file.

```javascript
writeQueue[filename] = writeQueue[filename].then(fn);
```

---

## Data Models

```
users.json   →  { id, username, password, orgId[] }
orgs.json    →  { id, name, description, type, members: [{ userId, role }] }
boards.json  →  { id, title, orgId }
lists.json   →  { id, title, boardId, order }
cards.json   →  { id, title, listId, order }
```

---

## Switching to MongoDB

Replace only the `server/db/*.db.js` files. Example:

```javascript
// File-based implementation
create: async (data) => {
  await writeData("users", data);
  return data;
};

// MongoDB implementation
create: async (data) => {
  return await UserModel.create(data);
};
```

Routes, controllers, and middlewares require zero changes.

---

## Pages

| Page      | File             | Description                                         |
| --------- | ---------------- | --------------------------------------------------- |
| Auth      | `index.html`     | Sign in / Sign up with tab toggle                   |
| Dashboard | `dashboard.html` | View and create organizations                       |
| Board     | `board.html`     | Manage boards and org members                       |
| Lists     | `lists.html`     | Kanban view — lists, cards, move card between lists |

---

## Postman Collection

Import `trello-postman.json` from the project root into Postman.

Set the following environment variables:

```
base_url  =  http://localhost:3000
token     =  <JWT received from /signin>
```

---

## .gitignore

```
.env
node_modules/
data/
```

> The `data/` directory is intentionally excluded from version control. Each environment maintains its own data store.
