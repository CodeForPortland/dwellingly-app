import React, { useState, useEffect } from "react";
import Card from "../card/Card";
import AddNote from "../AddNote/AddNote"
import { CARD_TYPES } from "../../constants";
import Icon from "../icon/Icon";
import "./TicketModal.scss";
import TicketModalDetails from "./TicketModalDetails";
import EditTicketModalDetails from "./EditTicketModalDetails";
import TitleAndPen, { useEditingStatus } from "../../components/TitleAndPen";
import NoteListItem from "../NoteListItem/NoteListItem";

const sortNotes = (noteA, noteB) => {
  if (noteA.created_at > noteB.created_at) return -1;
  return 1;
}


export const TicketModal = ({ show, onClose, ticket, handleAddNote, getTickets, updateSelectedTicket, handleDeleteNote, handleEditNoteText, editNoteModal }) => {

  const [showAddNote, setShowAddNote] = useState(false)
  const [editNotes, setEditNotes] = useState(false);
  const sortedNotes = ticket ? ticket.notes.sort(sortNotes) : null;
  const { isEditing, setEditingStatus } = useEditingStatus();

  useEffect(() => {
    if (!editNoteModal) setEditNotes(false);
  }, [editNoteModal])

  if (!show || !ticket) {
    return null;
  }

  const {
    issue,
    status,
    notes,
    id
  } = ticket;

  const toggleShowAddNote = () => {
    setShowAddNote(!showAddNote)
  }

  const handleIsEditing = (input = !isEditing) => {
    setEditingStatus(input)
  }

  const handleCloseTicket = () => {
    setEditingStatus(false);
    setShowAddNote(false)
    setEditNotes(false)
    onClose();
  }

  const handleEditNotes = () => {
    setEditNotes(!editNotes);
  }

  const localDeleteNote = (note) => {
    setEditNotes(false);
    handleDeleteNote(note);
  }

  return (
    <div className="ticket-window-modal">
      <div className="ticket-modal-container">
        <Card types={[CARD_TYPES.TICKET]}>
          <Card.Top>
            <Card.Content>
              <div className="card__summary">
                <div className="close-icon-container">
                  <button type="button" onClick={handleCloseTicket}>
                    <Icon id="close-icon" icon="close" />
                  </button>
                </div>
                <h3 id="ticket-modal-title" className="subtitle">
                  {status.toUpperCase()}
                </h3>
                <div className="ticket-modal-title-container">
                  <TitleAndPen
                    title={issue}
                    isEditing={isEditing}
                    setEditingStatus={setEditingStatus}
                  />
                </div>
                <hr />
                {isEditing ?
                  <EditTicketModalDetails
                    ticket={ticket}
                    handleIsEditing={handleIsEditing}
                    getTickets={getTickets}
                    updateSelectedTicket={updateSelectedTicket}
                  />
                  :
                  <TicketModalDetails ticket={ticket} />
                }
              </div>
            </Card.Content>
          </Card.Top>
          <Card.Bottom>
            <Card.Content>
              <div className="ticket-card-bottom-header">
                {` NOTES (${notes ? notes.length : 0})`}
                <div className="ticket-note-button-container">
                  <button
                    onClick={toggleShowAddNote}
                    className={`rounded${showAddNote ? "--is-editing" : ""}`} >
                    <i className={`fas fa-plus icon`} />
                  </button>
                  <button
                    className={`rounded${editNotes ? "--is-editing" : ""}`}
                    onClick={handleEditNotes}
                  >
                    <i className="fas fa-pen icon"></i>
                  </button>
                </div>
              </div>
              {showAddNote ?
                <AddNote
                  handleAddNote={handleAddNote}
                  toggleShowAddNote={toggleShowAddNote}
                  ticketID={id}
                />
                : null}
              <div id="scroll-container">
                {sortedNotes ? (
                  sortedNotes.map(note =>
                    <NoteListItem key={note.created_at}
                      note={note}
                      editNotes={editNotes}
                      localDeleteNote={localDeleteNote}
                      handleEditNoteText={handleEditNoteText}
                    />
                  )
                ) : (
                  <div className="ticket-card-note">
                    <p>No Notes found</p>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card.Bottom>
        </Card>
      </div>
    </div >
  );
};
