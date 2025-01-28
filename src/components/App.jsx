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
    setNotes(prevNotes => {
      return [...prevNotes, newNote];
    });
  }

  function deleteNote(id) {
    setNotes(prevNotes => {
      return prevNotes.filter((noteItem, index) => {
        return index !== id;
      });
    });
  }

  return (
    <div>
      <Header />
      <CreateArea onAdd={addNote} />
      {notes.map((noteItem, index) => {
        return (
          <Note
            key={index}
            id={index}
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
