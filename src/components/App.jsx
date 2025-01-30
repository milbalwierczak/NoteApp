import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import Login from "./Login";
import axios from "axios";

const API_URL = "http://localhost:4000";

function App() {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        const token = localStorage.getItem("token");
    
        const response = await axios.get("http://localhost:4000/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }

    if (user !== null) {
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

  async function register(userData) {
    try {
      await axios.post(`${API_URL}/register`, {userData});
      setErrorMessage("");
      setSuccessMessage("User registered! Now login.");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Register failed");
    }
  }

  async function login(userData) {
    try {
      const response = await axios.post(`${API_URL}/login`, {userData});
  
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      
      setUser(user);
      setErrorMessage("");
      setSuccessMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Login failed");
    }
  }

  function logout() {
    setNotes([]);
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <div>
      <Header />
      {!user ? (
        <Login onLogin={login} onRegister={register} errorMessage={errorMessage} successMessage={successMessage}/>
      ) : (
        <div>
          <button className="logout-button" onClick={logout}>Logout</button>
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
