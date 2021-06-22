import React, { useState, useEffect, useContext } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import UserContext from '../../UserContext';
import Accordion from '../../components/Accordion';
import { TicketModal } from '../../components/TicketModal';
import * as axios from 'axios';
import Search from "../../components/Search/index";
import Toast from '../../utils/toast';
import Modal from '../../components/Modal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import './tickets.scss';

const makeAuthHeaders = ({ user }) => ({ headers: { 'Authorization': `Bearer ${user.accessJwt}` } });

const pageButtonRenderer = ({
  page,
  active,
  disable,
  title,
  onPageChange
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    onPageChange(page);
  };
  if (title === 'previous page') {
    return (
      <li key={title} className="page-item">
        <a href="#" onClick={handleClick} title={title} className='button is-rounded is-small' >Prev</a>
      </li>
    );
  }
  if (title === 'next page') {
    return (
      <li key={title} className="page-item">
        <a href="#" onClick={handleClick} title={title} className='button is-rounded is-small' >Next</a>
      </li>
    );
  }
  if (active) {
    return (
      <li key={page} className="active page-item">
        <a href="#" onClick={handleClick} title={title}>{page}</a>
      </li>
    );
  }
  return (
    <li key={page} className="page-item">
      <a href="#" onClick={handleClick} title={title}>{page}</a>
    </li>
  );
};

const options = {
  // pageStartIndex: 0,
  sizePerPage: 5,
  hideSizePerPage: true,
  hidePageListOnlyOnePage: true,
  pageButtonRenderer
};

export function Tickets(props) {
  const [tickets, setTickets] = useState([]);
  const [viewedTicket, setViewedTicket] = useState(null)
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState({})
  const [deleteNoteModal, setDeleteNoteModal] = useState(false);
  const [editNoteModal, setEditNoteModal] = useState(false);

  let userContext = useContext(UserContext);

  const toggleTicketModal = (ticket) => {
    setViewedTicket((prevState) => (prevState ? null : ticket));
  }

  const columns = [{
    dataField: 'id',
    text: 'Ticket',
    sort: true,
    formatter: (cell, row) => <button
      onClick={() => toggleTicketModal(row)}
      className="link-button cell-align-left">
      <p className="cell-header">{row.tenant}</p>
      <p className="cell-subheader">{row.issue}</p>
    </button>,
    headerStyle: () => {
      return { width: "20%" };
    }
  }, {
    dataField: 'sender',
    text: 'Sender',
    sort: true,
    headerStyle: () => {
      return { width: "20%" };
    }
  }, {
    dataField: 'assigned',
    text: 'Assigned To',
    sort: true,
    headerStyle: () => {
      return { width: "20%" };
    }
  }, {
    dataField: 'status',
    text: 'Status',
    sort: true,
    headerStyle: () => {
      return { width: "10%" };
    }
  }, {
    dataField: 'created_at',
    text: 'Created',
    sort: true,
    headerStyle: () => {
      return { width: "15%" };
    }
  }, {
    dataField: 'updated_at',
    text: 'Updated',
    sort: true,
    headerStyle: () => {
      return { width: "15%" };
    }
  }];

  const getTickets = (context) => {
    axios.get(`/api/tickets`, makeAuthHeaders(context))
      .then((response) => {
        setTickets(response.data.tickets);
      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error);
      });
  };

  const setIsFilteredTicketsFalse = async () => {
    await setIsFiltered(false);
  };

  const setOutputState = async (output, isTrue) => {
    await setFilteredTickets(output)
    await setIsFiltered(isTrue)
  };

  const handleAddNote = (noteText, ticketID) => {
    axios.post(`/api/tickets/${ticketID}/notes`, { text: noteText }, makeAuthHeaders(userContext))
      .then(({ data }) => {
        viewedTicket.notes.push(data);
        getTickets(userContext);
      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error)
      })
  }

  const handleSelectRow = (ticket) => {
    setSelectedTickets([...selectedTickets, ticket])
  };

  const handleDeleteNote = (note) => {
    setSelectedNote(note);
    setDeleteNoteModal(true);
  }

  const handleEditNoteText = (note) => {
    setSelectedNote(note);
    setEditNoteModal(true)
  }


  const editNote = () => {
    const ticketID = viewedTicket.id;

    axios.patch(
      `/api/tickets/${ticketID}/notes/${selectedNote.id}`,
      { text: selectedNote.text },
      makeAuthHeaders(userContext))
      .then(({ data }) => {
        setViewedTicket({
          ...viewedTicket, notes: viewedTicket.notes.map(note => {
            if (note.id === data.id) note.text = data.text;
            return note;
          })
        })
        setEditNoteModal(false);

        Toast("Note Updated", "success");

      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error)
      })

  }


  const deleteNote = () => {
    const { id, ticket_id } = selectedNote;

    axios.delete(`/api/tickets/${ticket_id}/notes/${id}`, makeAuthHeaders(userContext))
      .then(({ data }) => {

        const filteredNotes = viewedTicket.notes.filter(note => note.id !== id);
        setViewedTicket({ ...viewedTicket, notes: filteredNotes })
        getTickets(userContext);

        Toast(data.message, "success");
      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error)
      })

    closeNoteModal();
  }

  const closeNoteModal = () => {
    setDeleteNoteModal(false);
    setEditNoteModal(false);
  }

  const handleDeselectRow = (ticket) => {
    console.log(selectedTickets)
    let filteredSet = selectedTickets.filter((t) => t.id !== ticket.id)
    console.log(filteredSet)
    setSelectedTickets(filteredSet)
  };

  const handleSelectAll = (tickets) => {
    setSelectedTickets(tickets)
  };

  const handleDeselectAll = (_) => {
    setSelectedTickets([])
  };

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal)
  };

  const deleteTickets = () => {
    let ticketIds = selectedTickets.map(t => t.id)
    axios({
      method: 'delete',
      url: '/api/tickets',
      data: {
        ids: ticketIds
      }
    }, makeAuthHeaders(userContext))
      .then((response) => {
        let ticketsToDelete = tickets.filter(t => !ticketIds.includes(t.id));

        setTickets(ticketsToDelete);
        setSelectedTickets([]);
        setShowDeleteModal(false)

        Toast(response.data.message, "success");
      })
      .catch((error) => {
        Toast(error.message, "error");
      });
  }

  const updateSelectedTicket = (updatedTicket) => {
    setViewedTicket(updatedTicket)
  }

  useEffect(() => {
    getTickets(userContext);
  }, [userContext])

  return (
    <UserContext.Consumer>
      {session => {
        userContext = session;
        return (
          <div className='main-container'>
            <div>
              <div>
                <div className="section-header">
                  <h2 className="page-title">Tickets</h2>
                </div>
                <Search
                  input={tickets}
                  outputLocation={filteredTickets}
                  isFilteredLocation={isFiltered}
                  setIsFilteredStateFalse={setIsFilteredTicketsFalse}
                  setOutputState={setOutputState}
                  placeholderMessage="Search by Ticket, Sender, Assignee, Status, or Date"
                />
                <Accordion
                  icon={<i className="fas fa-filter"></i>}
                  header="Filters"
                >
                  <div className="section-row">
                    <div className="filter-control">
                      <label>Opened From</label>
                      <input className="input is-rounded"></input>
                    </div>
                    <div className="filter-control">
                      <label>Category</label>
                      <div className="select is-rounded">
                        <select>
                          <option>All</option>
                          <option>Complaints</option>
                          <option>Maintenance</option>
                        </select>
                      </div>
                    </div>
                    <div className="filter-control">
                      <label>Status</label>
                      <div className="buttons has-addons">
                        <button className="button is-rounded btn-group">New </button>
                        <button className="button is-rounded btn-group">In Progress</button>
                        <button className="button is-rounded btn-group">Closed</button>
                      </div>
                    </div>
                  </div>
                </Accordion>
                <div className='bulk-actions-container py-3'>
                  <button
                    className={`button is-rounded is-primary ml-3 ${selectedTickets.length && 'is-active-button'}`}
                    onClick={toggleDeleteModal}
                  >
                    <FontAwesomeIcon
                      className="mr-3"
                      icon={faTrash}
                    />
                    Delete Tickets
                  </button>
                </div>
                <div>
                  <BootstrapTable
                    keyField="id"
                    data={isFiltered === true ? filteredTickets : tickets}
                    columns={columns}
                    pagination={paginationFactory(options)}
                    defaultSortDirection="asc"
                    bootstrap4={true}
                    headerClasses="table-header"
                    classes="full-size-table"
                    selectRow={({
                      mode: 'checkbox',
                      clickToSelect: true,
                      onSelect: (row, isSelect) => isSelect ? handleSelectRow(row) : handleDeselectRow(row),
                      onSelectAll: (isSelect, rows) => isSelect ? handleSelectAll(rows) : handleDeselectAll(rows),
                      sort: true,
                      headerColumnStyle: () => ({ width: "5%" }),
                      nonSelectableStyle: () => ({ color: '#999999' })
                    })}
                  />
                </div>
              </div>
              <TicketModal
                show={viewedTicket}
                onClose={toggleTicketModal}
                ticket={viewedTicket}
                handleAddNote={handleAddNote}
                getTickets={getTickets}
                updateSelectedTicket={updateSelectedTicket}
                handleDeleteNote={handleDeleteNote}
                handleEditNoteText={handleEditNoteText}
                editNoteModal={editNoteModal}
              />
            </div>
            {
              showDeleteModal &&
              <Modal
                titleText={selectedTickets.length > 1 ? "Delete Tickets" : "Delete Ticket"}
                content={
                  <div className="content">
                    <p>You have selected the following {selectedTickets.length} tickets to be deleted:</p>
                    <ul className="archive-tickets-list has-text-weight-bold">
                      {selectedTickets.map(t => (
                        <li>{t.tenant}: {t.issue}</li>
                      ))}
                    </ul>
                    <br />
                    <p>Are you sure you want to delete these tickets? This cannot be undone.</p>
                  </div>
                }
                hasButtons={true}
                hasRedirectButton={false}
                confirmButtonHandler={deleteTickets}
                confirmText="Delete"
                cancelButtonHandler={toggleDeleteModal}
                cancelText="Cancel"
                closeHandler={toggleDeleteModal}
              />
            }
            {deleteNoteModal &&
              <div className="note-modal"
              >
                <Modal
                  titleText={"Delete Note"}
                  content={
                    <div className="content">
                      <p>
                        You have selected the following note to be deleted:
                      </p>
                      <div className="selected-note-text">
                        {selectedNote.text}
                      </div>
                      <br />
                      <p>Are you sure you want to delete this note?  This cannot be undone.</p>
                    </div>
                  }
                  hasButtons={true}
                  hasRedirectButton={false}
                  confirmButtonHandler={deleteNote}
                  confirmText="Delete"
                  cancelButtonHandler={closeNoteModal}
                  cancelText="Cancel"
                  closeHandler={closeNoteModal}
                />
              </div>
            }
            {editNoteModal &&
              <div className="note-modal"
              >
                <Modal
                  titleText={"Edit Note"}
                  content={
                    <div className="content">
                      <p>
                        You have attempted to change this note's text to:
                      </p>
                      <div className="selected-note-text">
                        {selectedNote.text}
                      </div>
                      <br />
                      <p>Are you sure you want to change this note?  This cannot be undone.</p>
                    </div>
                  }
                  hasButtons={true}
                  hasRedirectButton={false}
                  confirmButtonHandler={editNote}
                  confirmText="Change"
                  cancelButtonHandler={closeNoteModal}
                  cancelText="Cancel"
                  closeHandler={closeNoteModal}
                />
              </div>
            }

          </div>
        );
      }
      }
    </UserContext.Consumer>
  );
}
