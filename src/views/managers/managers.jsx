import React, { useContext, useState, useEffect } from "react";
import BootstrapTable from "react-bootstrap-table-next";
import { Link } from "react-router-dom";
import * as axios from "axios";
import roleEnum from '../../Enums/RoleEnum';
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Search from "../../components/Search/index";
import Toast from '../../utils/toast';
import UserContext from '../../UserContext';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Icon from '../../components/icon/Icon';
import './managers.scss';
import { columns, mobileColumns } from './managersTableComponents';
import { useMediaQueries } from '@react-hook/media-query';



// transforms data from API into a format that can be used for bootstrap-table-next
const convertManagersDataForTable = (managersArray) => {
  const convertedManagers = managersArray.map(manager => {
    manager.fullName = `${manager.firstName} ${manager.lastName}`;

    if(manager.lastActive || !manager.archived) {
      manager.status = "Active";
    } else if(manager.archived) {
      manager.status = "Archived";
    } else {
      manager.status = "Pending";
    }
    return manager;
  });

  return convertedManagers;
};

const payload = {
  userrole: `${roleEnum.PROPERTY_MANAGER}`
};

const makeHeader = (context) => {
  return { Authorization: `Bearer ${context.user.accessJwt}` };
};

const getManagers = (header, storeInState, updateLoading) => {
  axios
    .post(`${process.env.REACT_APP_PROXY}/api/users/role`,
      payload,
      header
    )
    .then((response) => {
      const convertedData = convertManagersDataForTable(response.data.users);
      storeInState(convertedData);
      updateLoading(false);
    })
    .catch((error) => {
      updateLoading(false);
      Toast(error.message, "error");
      console.log(error);
    });
};

const expandRow = isSmallScreen => ({
  renderer: row => (
    <div>
      <label for="email">Email</label>
      <p id="email">{row.email}</p>
      <br />

      <label for="status">Status</label>
      <p id="status">{row.status}</p>
      <br />

      <label for="last-active">Last Usage</label>
      <p id="last-active">{row.lastActive}</p>
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


const Managers = () => {
  const [managersData, setManagersData] = useState();
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [checkboxRenderCount, setCheckboxRenderCount] = useState(0);
  const [nonSelectableRows, setNonSelectableRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const retrievedUserContext = useContext(UserContext);
  const axiosHeader = makeHeader(retrievedUserContext);

  const handleSelectRow = (manager) => setSelectedManagers([...selectedManagers, manager]);
  const handleDeselectRow = (manager) => setSelectedManagers(selectedManagers.filter(p => p.id !== manager.id));
  const handleSelectAll = setSelectedManagers;
  const handleDeselectAll = (_) => setSelectedManagers([]);

  const { matchesAll: isSmallScreen } = useMediaQueries({
    screen: 'screen',
    width: `(max-width: 950px)`
  });

  useEffect(() => {
    setIsLoading(true);
    getManagers(axiosHeader, setManagersData, setIsLoading);
  }, []);

  return (
    <div className="managers main-container">
      <div className="section-header">
        <h2 className="page-title">Property Managers</h2>
        <Link className="button is-rounded is-primary ml-4" to="/add/manager">
          + ADD NEW
        </Link>
      </div>
      <div>
        <Search placeholderMessage="Search property managers by name, property, or status" />
      </div>
      <div className="invite-button-container py-3">
        <button className="button is-rounded is-primary ml-3" type="submit">
          <FontAwesomeIcon
            className="button__envelope-icon mr-3"
            icon={faEnvelope}
          />{" "}
          Invite
        </button>
      </div>
      <div className="managers-list">
        {isLoading &&
          <Icon
            icon="gear"
            classNames="spinner" />}

        {managersData &&
          <BootstrapTable
            keyField="id"
            data={managersData}
            columns={isSmallScreen ? mobileColumns : columns}
            selectRow={({
              mode: 'checkbox',
              clickToSelect: isSmallScreen ? false : true,
              clickToExpand: isSmallScreen ? true : false,
              onSelect: (row, isSelect) => isSelect ? handleSelectRow(row) : handleDeselectRow(row),
              onSelectAll: (isSelect, rows) => isSelect ? handleSelectAll(rows) : handleDeselectAll(rows),
              sort: true,
              headerColumnStyle: () => ({ width: "5%" }),
              nonSelectable: nonSelectableRows,
              nonSelectableStyle: () => ({ color: '#999999' })
            })}
            defaultSortDirection="asc"
            bootstrap4={true}
            headerClasses="table-header"
            wrapperClasses="managers-list-wrapper"
            expandRow={expandRow(isSmallScreen)}
          />
        }
      </div>
    </div>
  );
};

export default Managers;
