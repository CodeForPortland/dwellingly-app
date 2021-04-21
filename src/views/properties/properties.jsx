import React, { useContext, useState, useEffect } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import UserContext from '../../UserContext';
import { Link } from "react-router-dom";
import * as axios from 'axios';
import Search from '../../components/Search';
import { ShowHideSwitch } from '../../components/ShowHideSwitch';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArchive } from '@fortawesome/free-solid-svg-icons';
import Toast from '../../utils/toast';
import Icon from '../../components/icon/Icon';
import Modal from '../../components/Modal';
import { mobileWidth } from '../../constants/index.js';
import { useMediaQueries } from '@react-hook/media-query';
import './properties.scss';

const makeAuthHeaders = ({ user }) => ({ headers: { 'Authorization': `Bearer ${user.accessJwt}` } });


const columns = [{
  dataField: 'name',
  formatter: (cell, row, rowIndex, formatExtraData) => {
    return (
      <Link key={row.id} to={`/manage/properties/${row.id}`}>
        {row.name}
      </Link>
    );
  },
  text: 'Name',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}, {
  dataField: 'propertyManagerNames',
  text: 'Property Managers',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}, {
  dataField: 'address',
  text: 'Address',
  sort: true,
  headerStyle: () => {
    return { width: "20%" };
  }
}, {
  dataField: 'totalTenants',
  text: 'Tenants',
  sort: true,
  headerStyle: () => {
    return { width: "10%" };
  }
}, {
  dataField: 'created_at',
  text: 'Added On',
  sort: true,
  headerStyle: () => {
    return { width: "10%" };
  }
}];

const mobileColumns = [{
  dataField: 'name',
  formatter: (cell, row, rowIndex, formatExtraData) => {
    return (
      <Link key={row.id} to={`/manage/properties/${row.id}`}>
        {row.name}
      </Link>
    );
  },
  text: 'Name',
  sort: true,
  headerStyle: () => {
    return { width: "45%" };

  }
}, {
  dataField: 'address',
  text: 'Address',
  sort: true,
  headerStyle: () => {
    return { width: "45%" };
  }
}, {
  dataField: 'totalTenants',
  text: 'Tenants',
  sort: true,
  headerStyle: () => {
    return { width: "10%" };
  }
}];

const expandRow = {
  renderer: row => (
    <div>
      <label for="property-managers">
        Property Managers
        </label>
      <p id="property-managers">{row.propertyManagerNames}</p>

      <br />
      <label for="created-at">
        Added On
        </label>
      <p id="created-at">{row.created_at}</p>

    </div>
  ),
  showExpandColumn: true
};

const getDisplayProperties = (properties, showArchived) => properties.filter(p => showArchived || !p.archived);

const formatPropertyData = (properties) => properties.map(p => ({
  id: p.id,
  archived: p.archived,
  name: p.name,
  propertyManagerNames: p.propertyManagerName && p.propertyManagerName.join(", "),
  address: p.address,
  totalTenants: p.tenantIDs && p.tenantIDs.length,
  created_at: p.created_at
}));


export const Properties = () => {
  const userContext = useContext(UserContext);

  const [allProperties, setAllProperties] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchedProperties, setSearchedProperties] = useState([]);
  const [displayProperties, setDisplayProperties] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [checkboxRenderCount, setCheckboxRenderCount] = useState(0);
  const [nonSelectableRows, setNonSelectableRows] = useState([]);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { matchesAll } = useMediaQueries({
    screen: 'screen',
    width: `(max-width: ${mobileWidth})`
  });

  const handleToggleArchived = () => {
    const newShowArchived = !showArchived;
    setShowArchived(newShowArchived);
    setDisplayProperties(getDisplayProperties(searchedProperties, newShowArchived));
  };
  const handleDisableSearch = () => {
    setSearchedProperties(allProperties);
    setIsSearchActive(false);
    setDisplayProperties(getDisplayProperties(allProperties, showArchived));
  };
  const handleSearchOutput = (output, isTrue) => {
    setSearchedProperties(output);
    setIsSearchActive(isTrue);
    setDisplayProperties(getDisplayProperties(output, showArchived));
  };
  const handleSelectRow = (property) => setSelectedProperties([...selectedProperties, property]);
  const handleDeselectRow = (property) => setSelectedProperties(selectedProperties.filter(p => p.id !== property.id));
  const handleSelectAll = setSelectedProperties;
  const handleDeselectAll = (_) => setSelectedProperties([]);

  useEffect(() => {
    setIsLoading(true);
    axios.get("/api/properties", makeAuthHeaders(userContext))
      .then((response) => {
        const { data: { properties } } = response;
        const propertyRows = formatPropertyData(properties);
        setAllProperties(propertyRows);
        setSearchedProperties(propertyRows);
        setDisplayProperties(getDisplayProperties(propertyRows, showArchived));
        setNonSelectableRows(properties.filter(property => property.archived).map(archivedProperty => archivedProperty.id));
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        Toast(error.message, "error");
      });
  }, [checkboxRenderCount]);


  const archiveProperties = () => {
    const propertyIds = selectedProperties.map(p => p.id);
    axios.patch(`/api/properties/archive`, { ids: propertyIds }, makeAuthHeaders(userContext))
      .then((response) => {
        Toast(`${propertyIds.length > 1 ? "Properties" : "Property"} Archived.`, "success");
        setCheckboxRenderCount(checkboxRenderCount + 1);
        toggleArchiveModal();
      })
      .catch((error) => {
        Toast(error.message, "error");
      });
  };

  const toggleArchiveModal = () => {
    setShowArchiveModal(!showArchiveModal);
  };


  return (
    <div className='main-container'>
      <div className="properties">
        <div className="section-header">
          <h2 className="page-title">Properties</h2>
          <Link className="button is-primary is-rounded ml-4" to="/add/property">+ ADD NEW</Link>
        </div>
        <div className="search-and-archive-container">
          <Search
            input={allProperties}
            outputLocation={searchedProperties}
            isFilteredLocation={isSearchActive}
            setIsFilteredStateFalse={handleDisableSearch}
            setOutputState={handleSearchOutput}
            placeholderMessage="Search by name, address, or property manager"
          />
          <ShowHideSwitch labelText="Archived:" isShowState={showArchived} handleToggleChange={handleToggleArchived} />
        </div>
        <div className='bulk-actions-container py-3'>
          <button
            className={`button is-rounded is-primary ml-3 ${selectedProperties.length && 'is-active-button'}`}
            onClick={toggleArchiveModal}
          >
            <FontAwesomeIcon
              className="mr-3"
              icon={faArchive}
            />
            Archive Properties
          </button>
        </div>
        <div className="properties-list">
          {isLoading
            ? <Icon
              icon="gear"
              classNames="spinner" />
            : <BootstrapTable
              key={`tables-of-properties--${checkboxRenderCount}`}
              wrapperClasses='properties-list-wrapper'
              keyField='id'
              data={displayProperties}
              columns={matchesAll ? mobileColumns : columns}
              selectRow={({
                mode: 'checkbox',
                clickToSelect: matchesAll ? false : true,
                clickToExpand: matchesAll ? true : false,
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
              expandRow={matchesAll && expandRow}
            />
          }
        </div>
      </div>
      {showArchiveModal &&
        <Modal
          titleText={selectedProperties.length > 1 ? "Archive Properties" : "Archive Property"}
          content={
            <div className="content">
              <p>You have selected the following {selectedProperties.length} properties to be archived:</p>
              <ul className="archive-properties-list has-text-weight-bold">
                {selectedProperties.map(p => (
                  <li>{p.name}</li>
                ))}
              </ul>
              <br />
              <p>Are you sure you want to archive these properties?</p>
            </div>
          }
          hasButtons={true}
          hasRedirectButton={false}
          confirmButtonHandler={archiveProperties}
          confirmText="Archive"
          cancelButtonHandler={toggleArchiveModal}
          cancelText="Cancel"
          closeHandler={toggleArchiveModal}
        />}
    </div>
  );
};
