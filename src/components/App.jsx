import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";
import axios from "axios";

const API_URL = "http://localhost:4000";


function App() {
  const [notes, setNotes] = useState([]);
  console.log("witam");

  useEffect(() => {
    async function fetchNotes() {
      try {
        console.log("serdecznie");
        const response = await axios.get(`${API_URL}/posts`);
        setNotes(response.data);
      } catch (error) {
        console.error("Error fetching notes: ", error);
      }
    }

    fetchNotes();
  }, []); 

  function addNote(newNote) {
    async function fetchNotes() {
      try {
        const response = await axios.post(`${API_URL}/posts`, newNote);
        console.log(response.data);
  
        setNotes((prevNotes) => {
          return [...prevNotes, response.data]; 
        });
      } catch (error) {
        console.error("Error creating post", error); 
      }
    }
  
    fetchNotes();
  }


  async function deleteNote(id) {
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  }


  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem) => {
        return (
          <Note
            key={noteItem.id}
            id={noteItem.id}
            title={noteItem.title}
            content={noteItem.content}
            onDelete={deleteNote}
          />
        );
      })}
      <Footer />
    </div>
  );
}

export default App;
