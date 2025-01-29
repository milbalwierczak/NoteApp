import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";

const API_URL = "http://localhost:4000";

function App() {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);

  // Pobieramy token z localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, []);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const token = localStorage.getItem("token"); // Pobranie tokena
        console.log("Token wysyłany do API:", token);
    
        const response = await axios.get("http://localhost:4000/posts", {
          headers: {
            Authorization: `Bearer ${token}`, // Wysyłanie tokena w nagłówku
          },
        });
    
        console.log("Notatki pobrane:", response.data);
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }

    console.log(user);

    if (user !== null) {  // Sprawdzenie czy user istnieje
      fetchNotes();
    }

  }, [user]);

  async function addNote(newNote) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await axios.post(`${API_URL}/posts`, newNote, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes((prevNotes) => [...prevNotes, response.data]);
    } catch (error) {
      console.error("Error creating post", error);
    }
  }

  async function deleteNote(id) {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      await axios.delete(`${API_URL}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }

  async function register(username, password) {
    try {
      await axios.post(`${API_URL}/register`, { username, password });
      console.log("User registered! Now login.");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  }

  async function login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, { username, password });    
      
      const { token, user } = response.data;  // Pobranie tokena i użytkownika
      localStorage.setItem("token", token);   // Zapis tokena

      setUser(user);
      console.log("Logged in!");
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <div>
      <Header />
      {!user ? (
        <div>
          <h2>Login</h2>
          <input type="text" id="username" placeholder="Username" />
          <input type="password" id="password" placeholder="Password" />
          <button onClick={() => login(document.getElementById("username").value, document.getElementById("password").value)}>
            Login
          </button>
          <button onClick={() => register(document.getElementById("username").value, document.getElementById("password").value)}>
            Register
          </button>
        </div>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>
          <CreateArea onAdd={addNote} />
          {notes.map((noteItem) => (
            <Note key={noteItem.id} id={noteItem.id} title={noteItem.title} content={noteItem.content} onDelete={deleteNote} />
          ))}
        </div>
      )}
      <Footer />
    </div>
  );
}

export default App;
