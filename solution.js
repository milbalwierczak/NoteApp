import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";

const app = express();
const port = 4000;
env.config();

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const corsOptions = { origin: "http://localhost:5173" };
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Middleware do autoryzacji
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Pobiera token z "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });

    req.user = user; // Przekazujemy użytkownika do kolejnych middleware
    next();
  });
}

// Rejestracja
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await db.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username", [username, hashedPassword]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Logowanie
app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body); // Sprawdź, co przychodzi z frontendu

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (user.rows.length === 0) {
      console.log("User not found");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isValid = await bcrypt.compare(password, user.rows[0].password);
    if (!isValid) {
      console.log("Invalid password");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      user: { id: user.rows[0].id, username: user.rows[0].username },
      token,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Zabezpieczone pobieranie notatek
app.get("/posts", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM notes WHERE user_id = $1", [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// Pobieranie danych zalogowanego użytkownika
app.get("/me", authenticateToken, (req, res) => {
  res.json(req.user);
});

// POST a new post
app.post("/posts", authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id; // Zmienna `id` pochodzi z `req.user` (danych użytkownika z tokena)

  // Zabezpieczenie przed SQL Injection:
  const query = `
    INSERT INTO notes (title, content, user_id)
    VALUES ($1, $2, $3)
    RETURNING id, title, content, user_id;
  `;

  try {
    const result = await db.query(query, [title, content, userId]);

    const newPost = result.rows[0];
    res.status(201).json(newPost);

  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});

// DELETE a specific post by providing the post id
app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM notes WHERE id = $1 RETURNING id", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ message: "Post deleted successfully", id });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
