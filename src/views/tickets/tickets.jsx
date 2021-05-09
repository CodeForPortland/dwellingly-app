import React, { Component } from 'react';
import { Link } from "react-router-dom";
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

export class Tickets extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tickets: [],
      viewedTicket: null,
      filteredTickets: [],
      isFiltered: false,
      selectedTickets: [],
      showDeleteModal: false
    };

    this.getTickets = this.getTickets.bind(this);
    this.toggleTicketModal = this.toggleTicketModal.bind(this);
  }

  componentDidMount() {
    this.getTickets(this.context);
  }

  toggleTicketModal(ticket) {
    this.setState(prevState => ({
      viewedTicket: prevState.viewedTicket ? null : ticket
    }));
  }

  columns = [{
    dataField: 'id',
    text: 'Ticket',
    sort: true,
    formatter: (cell, row) => <button
      onClick={() => this.toggleTicketModal(row)}
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

  getTickets = (context) => {
    axios.get(`/api/tickets`, { headers: { "Authorization": `Bearer ${context.user.accessJwt}` } })
      .then((response) => {
        this.setState({ tickets: response.data.tickets });
      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error);
      });
  };

  setIsFilteredTicketsFalse = async () => {
    await this.setState({ isFiltered: false });
  };

  setOutputState = async (output, isTrue) => {
    await this.setState({
      filteredTickets: output,
      isFiltered: isTrue
    });
  };

  handleSelectRow = (ticket) =>
    this.setState({
      selectedTickets: [...this.state.selectedTickets, ticket]
    });

  handleDeselectRow = (ticket) =>
    this.setState({
      selectedTickets: this.state.selectedTickets.filter(t => t.id !== ticket.id)
    });

  handleSelectAll = (tickets) =>
    this.setState({
      selectedTickets: tickets
    });

  handleDeselectAll = (_) =>
    this.setState({
      selectedTickets: []
    });

  toggleDeleteModal = () =>
    this.setState({
      showDeleteModal: !this.state.showDeleteModal
    });

  deleteTickets = () => {
    let ticketIds = this.state.selectedTickets.map( t => t.id )
    axios({
      method: 'delete',
      url: '/api/tickets',
      data: {
        ids: ticketIds
      },
      headers: { "Authorization": `Bearer ${this.context.user.accessJwt}` }
    }).then((response) => {
        this.setState({
          tickets: this.state.tickets.filter(t => !ticketIds.includes(t.id)),
          selectedTickets: [],
          showDeleteModal: false
        });
        Toast(response.data.message, "success");
      })
      .catch((error) => {
        Toast(error.message, "error");
      });
  }

  render() {
    return (
      <UserContext.Consumer>
        {session => {
          this.context = session;
          return (
            <div className='main-container'>
              <div>
                <div>
                  <div className="section-header">
                    <h2 className="page-title">Tickets</h2>
                    <Link className="button is-primary is-rounded ml-4" to="/add/ticket">+ ADD NEW</Link>
                  </div>
                  <Search
                    input={this.state.tickets}
                    outputLocation={this.state.filteredTickets}
                    isFilteredLocation={this.state.isFiltered}
                    setIsFilteredStateFalse={this.setIsFilteredTicketsFalse}
                    setOutputState={this.setOutputState}
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
                      className={`button is-rounded is-primary ml-3 ${this.state.selectedTickets.length && 'is-active-button'}`}
                      onClick={this.toggleDeleteModal}
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
                      data={this.state.isFiltered === true ? this.state.filteredTickets : this.state.tickets}
                      columns={this.columns}
                      pagination={paginationFactory(options)}
                      defaultSortDirection="asc"
                      bootstrap4={true}
                      headerClasses="table-header"
                      classes="full-size-table"
                      selectRow={({
                        mode: 'checkbox',
                        clickToSelect: true,
                        onSelect: (row, isSelect) => isSelect ? this.handleSelectRow(row) : this.handleDeselectRow(row),
                        onSelectAll: (isSelect, rows) => isSelect ? this.handleSelectAll(rows) : this.handleDeselectAll(rows),
                        sort: true,
                        headerColumnStyle: () => ({ width: "5%" }),
                        nonSelectableStyle: () => ({color: '#999999'})
                      })}
                    />
                  </div>
                </div>
                <TicketModal
                  show={this.state.viewedTicket}
                  onClose={this.toggleTicketModal}
                  ticket={this.state.viewedTicket}>
                </TicketModal>
              </div>
              {this.state.showDeleteModal &&
                <Modal
                  titleText={this.state.selectedTickets.length > 1 ? "Delete Tickets" : "Delete Ticket"}
                  content={
                    <div className="content">
                      <p>You have selected the following {this.state.selectedTickets.length} tickets to be deleted:</p>
                      <ul className="archive-tickets-list has-text-weight-bold">
                      {this.state.selectedTickets.map(t => (
                        <li>{t.tenant}: {t.issue}</li>
                      ))}
                      </ul>
                      <br/>
                      <p>Are you sure you want to delete these tickets? This cannot be undone.</p>
                    </div>
                  }
                  hasButtons={true}
                  hasRedirectButton={false}
                  confirmButtonHandler={this.deleteTickets}
                  confirmText="Delete"
                  cancelButtonHandler={this.toggleDeleteModal}
                  cancelText="Cancel"
                  closeHandler={this.toggleDeleteModal}
              />}
            </div>
          );
        }}
      </UserContext.Consumer>
    );
  }
}
