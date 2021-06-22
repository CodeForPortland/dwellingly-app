import React, { useState, useEffect } from 'react';
import "./NoteListItem.scss";

export default function NoteListItem({ note, editNotes, localDeleteNote, handleEditNoteText }) {

  const { user, created_at, text } = note;
  const [editText, setEditText] = useState(false);
  const [inputText, setInputText] = useState(text);

  useEffect(() => {
    setEditText(false);
    setInputText(text);
  }, [editNotes]);

  const handleEditText = () => {
    setEditText(true);
  }

  const handleCancel = () => {
    setInputText(text);
    setEditText(false);
  }

  const localEditNoteText = () => {
    handleEditNoteText({ ...note, text: inputText });
    setEditText(false);
  }

  return (
    <div className="ticket-card-note-container">
      <div className="ticket-card-note-header-row">
        <div className="ticket-card-note-header-row-left">
          {editNotes ?
            <div className="ticket-card-note-header-buttons">
              <button
                className='mini-rounded'
                onClick={() => localDeleteNote(note)}>
                <i className="fas fa-trash icon" />
              </button>
              <button
                className={`mini-rounded${editText ? "--is-editing" : ""}`}
                onClick={handleEditText}>
                <i className="fas fa-pen icon" />
              </button>
            </div>
            : null
          }
          <div className="ticket-card-note-header">
            {user}
          </div>
        </div>
        <div
          style={{ float: "right" }}
          className="ticket-card-note-header"
        >
          {created_at}
        </div>
      </div>
      {editText && editNotes ?
        <>
          <input
            type="text"
            className="ticket-card-input"
            id="edit-note-text"
            value={inputText}
            onChange={({ target }) => setInputText(target.value)}
            autoFocus
          />
          <div className="note-text-save">
            <button
              className="button is-secondary is-rounded ml-3 is-small"
              onClick={handleCancel}>
              Cancel
            </button>
            <button
              onClick={localEditNoteText}
              className="button is-primary is-rounded ml-3 is-small"
            >
              SAVE
            </button>
          </div>
        </>
        :
        <div className="ticket-card-note">
          <p>{inputText}</p>
        </div>
      }
    </div>
  )
}
