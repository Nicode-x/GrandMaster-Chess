# ♟️ Grandmaster — Real-Time Multiplayer Chess

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)

A real-time multiplayer chess application built with **Node.js**, **Express**, **Socket.IO**, and **chess.js**. Two players can connect and play against each other in the browser, while additional visitors join as spectators. The board is rendered entirely in the frontend using Unicode chess pieces and styled with Tailwind CSS.

---

## Features

- **Real-time gameplay** — moves are broadcast instantly to all connected clients via WebSockets (Socket.IO).
- **Role assignment** — the first two connections are assigned White and Black; all subsequent connections become spectators.
- **Board flip** — the Black player's board is automatically rotated 180° for a natural playing perspective.
- **Move validation** — illegal moves are rejected server-side using the chess.js rules engine; only legal FEN-verified positions are broadcast.
- **Game state alerts** — the UI dynamically detects and announces Check, Checkmate, Stalemate, and Draw.
- **Move history** — a live sidebar panel tracks every move in `from → to` format.
- **Pawn promotion** — auto-promotes to Queen by default.
- **Responsive layout** — built with Tailwind CSS and a dark glassmorphism design, adapting gracefully from mobile to desktop.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web framework | Express 5 |
| Real-time transport | Socket.IO 4 |
| Chess rules engine | chess.js |
| Templating | EJS |
| Frontend styling | Tailwind CSS (CDN) |
| Database (installed) | Mongoose / MongoDB |

---

## Project Structure

```
chess.com backend/
├── app.js                        # Express server, Socket.IO logic, game state
├── package.json
├── routes/
│   └── index.js                  # Placeholder route
├── views/
│   └── index.ejs                 # Main HTML page (Tailwind, board UI)
└── public/
    └── javascripts/
        └── chessgame.js          # Client-side board rendering and socket events
```

---

## Getting Started

### Prerequisites

- Node.js v18 or later
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/grandmaster-chess.git
cd grandmaster-chess

# Install dependencies
npm install
```

### Running the App

```bash
node app.js
```

The server starts on **http://localhost:3000**.

Open the URL in two different browser windows or tabs — the first will be assigned **White**, the second will be assigned **Black**. Any further connections will join as **Spectators**.

---

## How It Works

### Server (`app.js`)

The server maintains a single shared game instance (`new Chess()`) and a `players` object that maps socket IDs to color roles. When a move event arrives from a client, the server:

1. Checks that it is actually the turn of the player who sent the move.
2. Validates and applies the move using `chess.move()`.
3. Broadcasts the updated move and FEN board state to all connected clients.

### Client (`chessgame.js`)

The client maintains its own local `Chess` instance, which it keeps in sync by loading FEN strings received from the server. The board is re-rendered on every move by iterating over `chess.board()` and creating DOM elements for each square and piece. Drag-and-drop is handled natively with the HTML5 Drag and Drop API.

---

## Socket Events

| Event | Direction | Description |
|---|---|---|
| `playerRole` | Server → Client | Assigns `"w"` or `"b"` to the connecting player |
| `spectatorRole` | Server → Client | Notifies a third+ connection that they are spectating |
| `move` | Client → Server | Sends a move object `{ from, to, promotion }` |
| `move` | Server → Client | Broadcasts a validated move to all clients |
| `boardState` | Server → Client | Broadcasts the full FEN string after each move |
| `invalidMove` | Server → Client | Notifies a player their move was rejected |

---

## Environment Variables

The `.env` file is present but currently empty. You can use it to configure:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/chess
```

*(Mongoose is installed as a dependency but not yet wired up — ideal for adding persistent game history.)*

---

## Possible Enhancements

- **Persistent game history** — use the already-installed Mongoose/MongoDB to save completed games.
- **Rematch / New game** — add a button to reset the board without reconnecting.
- **Timer** — add a chess clock per player.
- **Named rooms** — allow multiple simultaneous games via Socket.IO rooms.
- **SAN move notation** — display moves in standard algebraic notation (e.g., `e4`, `Nf3`) instead of coordinate format.

---

## License

ISC
