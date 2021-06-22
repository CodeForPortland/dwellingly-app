import React, { useState } from 'react';
import './AddNote.scss'

export default function AddNote({ handleAddNote, toggleShowAddNote, ticketID }) {
  const [noteText, setNoteText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault();
    if (noteText !== "") {
      handleAddNote(noteText, ticketID)
      setNoteText("")
      toggleShowAddNote();
    }
  }

  return (
    <div className={"add-note-container"}>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="new-note-input"
          className={"add-note-input"}
          onChange={({ target }) => { setNoteText(target.value) }}
          value={noteText}
          autoFocus
        />
        <div className={'add-note-add-button-div'}>
          <button
            className="button is-primary is-rounded ml-4 is-small" >
            ADD
          </button>
        </div>
      </form>
    </div>
  )
}
