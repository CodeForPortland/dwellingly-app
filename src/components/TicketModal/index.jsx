import React, { Component, useState } from "react";
import Card from "../card/Card";
import AddNote from "../AddNote/AddNote"
import { CARD_TYPES } from "../../constants";
import Icon from "../icon/Icon";
import "./TicketModal.scss";

export const TicketModal = (props) => {
  const [showAddNote, setShowAddNote] = useState(false)
  if (!props.show || !props.ticket) {
    return null;
  }
  const {
    assigned,
    issue,
    created_at,
    sender,
    status,
    tenant,
    updated_at,
    urgency,
    notes,
    id
  } = props.ticket;

  const toggleShowAddNote = () => {
    setShowAddNote(!showAddNote)
  }

  const handleCloseTicket = () => {
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
                <div className="ticket-modal-title-container">
                  <Icon icon="comment" />
                  <h3 id="ticket-modal-title" className="subtitle">
                    {status.toUpperCase()}
                  </h3>
                </div>
                <h5 id="ticket-modal-issue" className="meta">
                  {issue}
                </h5>
                <hr />
                <div>
                  <div style={{ float: "left" }}>
                    <div className="ticket-details-section">
                      <p className="ticket-detail-label">SENDER</p>
                      <p>{sender}</p>
                    </div>
                    <div className="ticket-details-section">
                      <p className="ticket-detail-label">TENANT</p>
                      <p>{tenant}</p>
                    </div>
                    <div className="ticket-details-section">
                      <p className="ticket-detail-label">ASSIGNEE</p>
                      <p>{assigned}</p>
                    </div>
                  </div>
                  <div
                    className="ticket-details-section"
                    style={{ float: "right", textAlign: "right" }}
                  >
                    <div className="ticket-details-section">
                      <p className="ticket-detail-label">URGENCY</p>
                      <p>{urgency.toUpperCase()}</p>
                    </div>
                    <div className="ticket-details-section">
                      <p className="ticket-detail-label">SENT</p>
                      <p>{created_at}</p>
                    </div>
                  </div>
                </div>
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
