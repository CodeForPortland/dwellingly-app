import React, { useContext, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import axios from "axios";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArchive } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../../UserContext';
import useMountEffect from '../../utils/useMountEffect';
import Toast from '../../utils/toast';
import Icon from '../../components/icon/Icon';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Search from "../../components/Search/index";
import { ShowHideSwitch } from '../../components/ShowHideSwitch';
import Modal from '../../components/Modal';
import { columns, mobileColumns } from './tenantsTableComponents';
import { mobileWidth } from '../../constants/index.js';
import { useMediaQueries } from '@react-hook/media-query';
import './tenants.scss';

const makeAuthHeaders = ({ user }) => ({ headers: { 'Authorization': `Bearer ${user.accessJwt}` } });

const addPropertyNames = ((tenants, allProperties) => {
  return tenants.map(tenant => {
    if(tenant.lease) {
      const propertyIndex = allProperties.findIndex(property =>
        property.id === tenant.lease.propertyID);
      tenant.propertyName = allProperties[propertyIndex].name;
    }
    return tenant;
  });
});

const formatTenantData = tenants => tenants.map(tenant => {
  const { id, lease, phone, fullName, archived } = tenant;
  const staff = tenant.staff.map(staff => {
    return `${staff.firstName} ${staff.lastName}`;
  });
  return { id, lease, phone, fullName, staff, archived };
});

const sortTenantData = tenants => tenants.sort((a, b) => {
  if(a.fullName < b.fullName) {
    return -1;
  }
  if(a.fullName > b.fullName) {
    return 1;
  }
  return 0;
});

const getDisplayTenants = (tenants, showHoused, showArchived) => {
  return tenants.filter(tenant => (showHoused || tenant.lease) && (showArchived || !tenant.archived));
};

const expandRow = isSmallScreen => ({
  renderer: row => (
    <div>
      <phone for="phone">
        Phone
      </phone>
      <p id="created-at">{row.phone}</p>
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
export function Tenants() {
  const userContext = useContext(UserContext);

  const [allTenants, setAllTenants] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState([]);
  const [showHoused, setShowHoused] = useState(false);
  const [searchedTenants, setSearchedTenants] = useState([]);
  const [displayTenants, setDisplayTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [nonSelectableRows, setNonSelectableRows] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [checkboxRenderCount, setCheckboxRenderCount] = useState(0);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { matchesAll: isSmallScreen } = useMediaQueries({
    screen: 'screen',
    width: `(max-width: ${mobileWidth})`
  });

  useMountEffect(() => {
    fetchAllTenants();
  });

  const fetchAllTenants = () => {
    let allProperties;
    setIsLoading(true);
    axios.get(`/api/properties`, makeAuthHeaders(userContext))
      .then(propertyResponse => {
        const { data: { properties } } = propertyResponse;
        allProperties = properties;
      })
      .then(() =>
        axios.get("/api/tenants", makeAuthHeaders(userContext))
      )
      .then((response) => {
        const { data: { tenants } } = response;
        const tenantRows = formatTenantData(tenants);
        const tenantsWithProperties = addPropertyNames(tenantRows, allProperties);
        const sortedTenants = sortTenantData(tenantsWithProperties);
        setAllTenants(sortedTenants);
        setSearchedTenants(sortedTenants);
        setDisplayTenants(getDisplayTenants(sortedTenants, showHoused, showArchived));

        const archivedTenants = sortedTenants.filter(tenant => tenant.archived);
        setNonSelectableRows(archivedTenants.map(archivedTenant => archivedTenant.id));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        Toast(error.message, "error");
      });
  };

  const handleToggleHoused = () => {
    setShowHoused(!showHoused);

    if(isSearchActive) {
      setDisplayTenants(getDisplayTenants(searchedTenants, !showHoused, showArchived));
    } else {
      setDisplayTenants(getDisplayTenants(allTenants, !showHoused, showArchived));
    }
    const newSelectedTentants = getDisplayTenants(selectedTenants, !showHoused, showArchived);
    setSelectedTenants(newSelectedTentants);
  };

  const handleDisableSearch = () => {
    setSearchedTenants(allTenants);
    setIsSearchActive(false);
    setDisplayTenants(getDisplayTenants(allTenants, showHoused, showArchived));
  };

  const handleSearchOutput = (output, isTrue) => {
    setSearchedTenants(output);
    setIsSearchActive(isTrue);
    setDisplayTenants(getDisplayTenants(output, showHoused, showArchived));
  };

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);

    if(isSearchActive) {
      setDisplayTenants(getDisplayTenants(searchedTenants, showHoused, !showArchived));
    } else {
      setDisplayTenants(getDisplayTenants(allTenants, showHoused, !showArchived));
    }
  };

  const toggleArchiveModal = () => {
    setShowArchiveModal(!showArchiveModal);
  };

  const handleSelectRow = (tenant) => {
    setSelectedTenants([...selectedTenants, tenant]);
  };

  const handleDeselectRow = (tenant) => {
    setSelectedTenants(selectedTenants.filter(sTenant => sTenant.id !== tenant.id));
  };

  const handleSelectAll = setSelectedTenants;

  const handleDeselectAll = (_) => setSelectedTenants([]);


  const archiveTenants = () => {
    const tenantIds = selectedTenants.map(tenant => tenant.id);

    Promise.all(tenantIds.map(tenantId =>
      axios.put(`/api/tenants/${tenantId}`, { archived: true }, makeAuthHeaders(userContext))
        .then((response) => {
          setCheckboxRenderCount(checkboxRenderCount + 1);
        })
        .then(() => setSelectedTenants([]))
        .catch((error) => {
          Toast(error.message, "error");
          console.log(error);
        })
    ))
      .then(() => {
        Toast(`Tenants archived successfully`, "success");
      });

    fetchAllTenants();
    toggleArchiveModal();
  };

  return (
    <div className='main-container'>
      <div className='tenants'>
        <div className='section-header'>
          <h2 className='page-title'>Tenants</h2>
          <Link
            className='button is-primary is-rounded ml-4'
            to='/add/tenant'>+ ADD NEW</Link>
        </div>
        <div className='search-and-archive-container'>
          <Search
            input={allTenants}
            outputLocation={searchedTenants}
            isFilteredLocation={isSearchActive}
            setIsFilteredStateFalse={handleDisableSearch}
            setOutputState={handleSearchOutput}
            placeholderMessage="Search tenants by name, property, or JOIN staff" />
          <ShowHideSwitch
            id="housedToggleSwitch"
            labelText="Unhoused:"
            isShowState={showHoused}
            handleToggleChange={handleToggleHoused}
          />

          <ShowHideSwitch
            id="archivedToggleSwitch"
            labelText="Archived:"
            isShowState={showArchived}
            handleToggleChange={handleToggleArchived}
          />

        </div>
        <div className='bulk-actions-container py-3'>
          <button
            className={`button is-rounded is-primary ml-3 ${selectedTenants.length && 'is-active-button'}`}
            onClick={toggleArchiveModal}
          >
            <FontAwesomeIcon
              className="mr-3"
              icon={faArchive}
            />
            Archive Tenants
          </button>
        </div>

        <div className="tenants-list">
          {isLoading
            ? <Icon
              icon="gear"
              classNames="spinner" />
            : <BootstrapTable
              key={`tables-of-tenants--${checkboxRenderCount}`} wrapperClasses='tenants-list-wrapper'
              keyField='id'
              data={displayTenants}
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
              defaultSorted={[
                {
                  dataField: 'propertyName',
                  order: 'asc'
                }]}
              bootstrap4={true}
              headerClasses='table-header'
              expandRow={expandRow(isSmallScreen)}
            />
          }
        </div>


      </div >
      {showArchiveModal &&
        <Modal
          titleText={selectedTenants.length > 1 ? "Archive Tenants" : "Archive Tenant"}
          content={
            <div>
              <p>You have selected the following {selectedTenants.length} tenants to be archived: </p>
              <ul>
                {selectedTenants.map(tenant => (
                  <li
                    key={tenant.fullName}
                    className="archive-tenants-list has-text-weight-bold">
                    {tenant.fullName}
                  </li>
                )

                )}
                <br />
                <p>Are you sure you want to archive these tenants?</p>
              </ul>
            </div>
          }
          hasButtons={true}
          hasRedirectButton={false}
          confirmButtonHandler={archiveTenants}
          confirmText="Yes"
          cancelButtonHandler={toggleArchiveModal}
          cancelText="No"
          closeHandler={toggleArchiveModal}
        />
      }

    </div >
  );
};
