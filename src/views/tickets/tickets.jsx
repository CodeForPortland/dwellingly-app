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
import { faChevronRight, faChevronDown, faTrash } from '@fortawesome/free-solid-svg-icons';
import { mobileWidth } from '../../constants/index.js';
import { useMediaQueries } from '@react-hook/media-query';
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
  if(title === 'previous page') {
    return (
      <li key={title} className="page-item">
        <button onClick={handleClick} title={title} className='button is-rounded is-small' >Prev</button>
      </li>
    );
  }
  if(title === 'next page') {
    return (
      <li key={title} className="page-item">
        <button onClick={handleClick} title={title} className='button is-rounded is-small' >Next</button>
      </li>
    );
  }
  if(active) {
    return (
      <li key={page} className="active page-item">
        <button onClick={handleClick} title={title}>{page}</button>
      </li>
    );
  }
  return (
    <li key={page} className="page-item">
      <button onClick={handleClick} title={title}>{page}</button>
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

const expandRow = isSmallScreen => ({
  renderer: row => (
    <div>
      <label for="assigned-to">
        Assigned To
      </label>
      <p id="assigned-to">{row.assigned}</p>

      <label for="created-at">
        Created
      </label>
      <p id="created-at">{row.created_at}</p>

      <label for="updated-at">
        Updated
      </label>
      <p id="updated-at">{row.updated_at}</p>
    </div>
  ),
  showExpandColumn: isSmallScreen ? true : false,
  expandColumnRenderer: ({ expanded }) => {
    if(expanded) {
      return (
        <FontAwesomeIcon
          className="button__envelope-icon mr-3"
          icon={faChevronDown}
        />
      );
    }
    return (
      <FontAwesomeIcon
        className="button__envelope-icon mr-3"
        icon={faChevronRight}
      />
    );
  },
});

export function Tickets(props) {
  const [tickets, setTickets] = useState([]);
  const [viewedTicket, setViewedTicket] = useState(null);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { matchesAll: isSmallScreen } = useMediaQueries({
    screen: 'screen',
    width: `(max-width: ${mobileWidth})`
  });

  let userContext = useContext(UserContext);

  const toggleTicketModal = (ticket) => {
    setViewedTicket((prevState) => (prevState ? null : ticket));
  };

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
    await setFilteredTickets(output);
    await setIsFiltered(isTrue);
  };

  const handleAddNote = (noteText, ticketID) => {
    axios.post(`/api/tickets/${ticketID}/notes`, { text: noteText }, makeAuthHeaders(userContext))
      .then(({ data }) => {

        viewedTicket.notes.push(data);
        getTickets(userContext);
      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error);
      });
  };

  const handleSelectRow = (ticket) => {
    setSelectedTickets([...selectedTickets, ticket]);
  };

  const handleDeselectRow = (ticket) => {
    console.log(selectedTickets);
    let filteredSet = selectedTickets.filter((t) => t.id !== ticket.id);
    console.log(filteredSet);
    setSelectedTickets(filteredSet);
  };

  const handleSelectAll = (tickets) => {
    setSelectedTickets(tickets);
  };

  const handleDeselectAll = (_) => {
    setSelectedTickets([]);
  };

  const toggleDeleteModal = () => {
    setShowDeleteModal(!showDeleteModal);
  };

  const deleteTickets = () => {
    let ticketIds = selectedTickets.map(t => t.id);
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
        setShowDeleteModal(false);

        Toast(response.data.message, "success");
      })
      .catch((error) => {
        Toast(error.message, "error");
      });
  };

  const updateSelectedTicket = (updatedTicket) => {
    setViewedTicket(updatedTicket);
  };

  useEffect(() => {
    getTickets(userContext);
  }, [userContext]);

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
                    columns={isSmallScreen ? mobileColumns : columns}
                    pagination={paginationFactory(options)}
                    defaultSortDirection="asc"
                    bootstrap4={true}
                    headerClasses="table-header"
                    classes="full-size-table"
                    selectRow={({
                      mode: 'checkbox',
                      clickToSelect: isSmallScreen ? false : true,
                      clickToExpand: isSmallScreen ? true : false,
                      onSelect: (row, isSelect) => isSelect ? handleSelectRow(row) : handleDeselectRow(row),
                      onSelectAll: (isSelect, rows) => isSelect ? handleSelectAll(rows) : handleDeselectAll(rows),
                      sort: true,
                      headerColumnStyle: () => ({ width: "5%" }),
                      nonSelectableStyle: () => ({ color: '#999999' })
                    })}
                    defaultSorted={[
                      {
                        dataField: 'propertyName',
                        order: 'asc'
                      }]}
                    expandRow={expandRow(isSmallScreen)}
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
          </div>
        );
      }
      }
    </UserContext.Consumer>
  );
}
