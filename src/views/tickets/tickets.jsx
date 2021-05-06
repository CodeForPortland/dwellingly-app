import React, { useContext, useState, useEffect } from "react";
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

import { useMediaQueries } from '@react-hook/media-query';
import Icon from '../../components/icon/Icon';
import './tickets.scss';

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
        <a href="#" onClick={handleClick} title={title} className='button is-rounded is-small' >Prev</a>
      </li>
    );
  }
  if(title === 'next page') {
    return (
      <li key={title} className="page-item">
        <a href="#" onClick={handleClick} title={title} className='button is-rounded is-small' >Next</a>
      </li>
    );
  }
  if(active) {
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



const makeHeader = (context) => {
  return { Authorization: `Bearer ${context.user.accessJwt}` };
};
const retrievedUserContext = useContext(UserContext);
const axiosHeader = makeHeader(retrievedUserContext);


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

const mobileColumns = [{
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
    return { width: "40%" };
  }
}, {
  dataField: 'sender',
  text: 'Sender',
  sort: true,
  headerStyle: () => {
    return { width: "40%" };
  }
}, {
  dataField: 'assigned',
  text: 'Assigned To',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}];

const expandRow = {
  renderer: row => (
    <div>
      <label for="status">Status</label>
      <p id="status">{row.status}</p>
      <br />

      <label for="created-at">Created</label>
      <p id="created-at">{row.created_at}</p>
      <br />

      <label for="updated-at">Updated</label>
      <p id="updated-at">{row.updated_at}</p>
    </div>
  ),
  showExpandColumn: true
};

const getTickets = (context) => {
  axios.get(`/api/tickets`, { headers: { "Authorization": `Bearer ${context.user.accessJwt}` } })
    .then((response) => {
      setTicketsData({ tickets: response.data.tickets });
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
  setIsFiltered(isTrue);
};



const Tickets = () => {
  const [ticketsData, setTicketsData] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { matchesAll } = useMediaQueries({
    screen: 'screen',
    width: `(max-width: 950px)`
  });
  useEffect(() => {
    setIsLoading(true);
    getTickets(axiosHeader, setTicketsData, setIsLoading);
  }, []);
  return (
    <div className='tickets main-container'>
      <div className="section-header">
        <h2 className="page-title">Tickets</h2>
      </div>
      <div>
        <Search
          input={ticketsData}
          outputLocation={filteredTickets}
          isFilteredLocation={isFiltered}
          setIsFilteredStateFalse={setIsFilteredTicketsFalse}
          setOutputState={setOutputState}
          placeholderMessage="Search by Ticket, Sender, Assignee, Status, or Date"
        />
      </div>
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
      <div className="tickets-list">
        {isLoading &&
          <Icon
            icon="gear"
            classNames="spinner" />}

        {ticketsData &&
          <BootstrapTable
            keyField="id"
            data={isFiltered === true ? filteredTickets : ticketsData}
            columns={columns}
            pagination={paginationFactory(options)}
            defaultSortDirection="asc"
            bootstrap4={true}
            headerClasses="table-header"
            classes="full-size-table"
            expandRow={expandRow}
          />
        }
      </div>
      <TicketModal
        show={selectedTickets}
        onClose={toggleTicketModal}
        ticket={selectedTickets}>
      </TicketModal>
    </div>
  );
};

export default Tickets;
