import React, { useState } from "react";
import Card from "../card/Card";
import AddNote from "../AddNote/AddNote"
import { CARD_TYPES } from "../../constants";
import Icon from "../icon/Icon";
import "./TicketModal.scss";
import TicketModalDetails from "./TicketModalDetails";
import EditTicketModalDetails from "./EditTicketModalDetails";
import TitleAndPen, { useEditingStatus } from "../../components/TitleAndPen";


export const TicketModal = (props) => {
  const [showAddNote, setShowAddNote] = useState(false)
  // const [isEditing, setEditingStatus] = useState(false);
  const { isEditing, setEditingStatus } = useEditingStatus()

  if (!props.show || !props.ticket) {
    return null;
  }
  const {
    issue,
    status,
    notes,
    id
  } = props.ticket;

  const toggleShowAddNote = () => {
    setShowAddNote(!showAddNote)
  }

  const handleIsEditing = (input = !isEditing) => {
    setEditingStatus(input)
  }

  const handleCloseTicket = () => {
    setEditingStatus(false);
    setShowAddNote(false)
    props.onClose();
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
                    ticket={props.ticket}
                    handleIsEditing={handleIsEditing}
                    getTickets={props.getTickets}
                    updateSelectedTicket={props.updateSelectedTicket}
                  />
                  :
                  <TicketModalDetails ticket={props.ticket} />
                }
              </div>
            </Card.Content>
          </Card.Top>
          <Card.Bottom>
            <Card.Content>
              <div className="ticket-card-bottom-header">
                {` NOTES (${notes ? notes.length : 0})`}
                <div onClick={toggleShowAddNote}>
                  <i className="fas fa-plus-circle icon-inline-space" />
                </div>
              </div>
              {showAddNote ?
                <AddNote
                  handleAddNote={props.handleAddNote}
                  toggleShowAddNote={toggleShowAddNote}
                  ticketID={id}
                />
                : null}
              <div id="scroll-container">
                {notes ? (
                  notes.map((note) => {
                    return (
                      <div className="ticket-card-note-container">
                        <div className="ticket-card-note-header-row">
                          <p
                            style={{ float: "left" }}
                            className="ticket-card-note-header"
                          >
                            {note.user}
                          </p>
                          <p
                            style={{ float: "right" }}
                            className="ticket-card-note-header"
                          >
                            {note.created_at}
                          </p>
                        </div>
                        <div className="ticket-card-note">
                          <p>{note.text}</p>
                        </div>
                      </div>
                    );
                  })
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
    </div>
  );
};
