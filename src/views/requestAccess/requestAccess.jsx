import React, { useContext, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import * as axios from "axios";
import UserContext from '../../UserContext';
import Toast from '../../utils/toast';
import { SearchPanel, SearchPanelVariant } from "react-search-panel";
import { AddProperty } from '../addProperty/addProperty';
import Modal from '../../components/Modal';
import RoleEnum from '../../Enums/RoleEnum';

import './requestAccess.scss';

const makeAuthHeaders = ({ user }) => ({ headers: { 'Authorization': `Bearer ${user.accessJwt}` } });

const RoleDropDown = (props) => {
  return (
    <div className="section-row">
      <div className="select is-rounded">
        <select
          defaultValue='default'
          onChange={e => props.selectionHandler(e.target.value)}>
          <option value='default' disabled defaultValue>Select Role</option>
          {
            props.selectionOptions.map((role, index) =>
              <option key={index}>{role}</option>
            )
          }
        </select>
      </div>
    </div>
  );
};

// Section under CONTACT
export const InfoField = ({ label, info, changeHandler }) => {
  const infoField = "has-text-weight-bold " + ((label === "Phone") ? "phone-field" : (label === "Email" ? "email-field" : "name-field"));
  return (
    <div>
      <hr className="line" ></hr>
      <span className="input-field"> {label}
        <input className={`contact-input ${infoField}`} type="text" defaultValue={info} onChange={(e) => changeHandler(e.target.value)}>
        </input>
      </span>
    </div>
  );
};

export const RequestAccess = (props) => {
  // Get context for API auth header
  const userContext = useContext(UserContext);

  const {
    firstName,
    lastName,
    email,
    id
  } = props.location.state;

  const [selectionOptions, setSelectionOptions] = useState([]);
  const [roleSelection, selectionHandler] = useState("");
  const [fName, setFirstName] = useState(firstName);
  const [lName, setLastName] = useState(lastName);
  const [emailAddress, setEmail] = useState(email);
  const [propertySearchText, setPropertySearchText] = useState("");
  const [propertySelection, setPropertySelection] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [propertySearchResults, setPropertySearchResults] = useState([]);
  const [showAddProperty, setShowAddProperty] = useState(false);

  useEffect(() => {
    setSelectionOptions(Object.keys(RoleEnum));
    getProperties();
  }, []);

  useEffect(() => {
    let choices = propertyOptions.filter(
      p => p.description.toLowerCase().includes(propertySearchText.toLowerCase()))
    setPropertySearchResults(choices);
  }, [propertySearchText, propertyOptions])
  
  const getProperties = () => {
    axios.get("/api/properties", makeAuthHeaders(userContext))
      .then(({ data }) => {
        let properties = data.properties && data.properties.length > 0
          ? data.properties.map(property => {
            return {
              key: property.id,
              description: `${property.name}, ${property.address}`
            }
          })
          : data.properties
        setPropertyOptions(properties);
        setPropertySearchResults(properties);
        setShowAddProperty(false);
      });
  }

  const grantAccess = () => {
    axios.patch(`/api/user/${id}`, {
      role: RoleEnum[roleSelection.replace(' ', '_')],
      firstName: fName,
      lastName: lName,
      email: emailAddress,
      propertyIDs: roleSelection === "PROPERTY MANAGER"
        ? propertySelection.map(p => p.key)
        : []
    }, makeAuthHeaders(userContext))
      .then((response) => {
        Toast("User access granted!", "success");
      })
      .catch((error) => {
        Toast(error.message, "error");
        console.log(error);
      });
  };

  const handleAddPropertyCancel = () => {
    setShowAddProperty(false);
  }

  /**
   * Handle property search input
   * @param {*} event
   */
  const handlePropertySearch = (event) => {
    const { value } = event.target;
    if (!value || value.length === 0) {
      setPropertySearchResults(propertyOptions);
      setPropertySearchText("");
    } else {
      setPropertySearchText(value);
    }
  };

  return (
    <div className='main-container'>
      <div className="page-title"> Request for Access </div>
      <div className="sub-title"> CONTACT </div>
      <InfoField label={"First Name"} changeHandler={setFirstName} info={firstName} />
      <InfoField label={"Last Name"} changeHandler={setLastName} info={lastName} />
      {/* <InfoField label={"Phone"} info={data['phone']} /> */}
      <InfoField label={"Email"} changeHandler={setEmail} info={email} />
      <hr className="line" ></hr>
      <div className="sub-title sub-title-padding"> ASSIGN ROLE </div>
      <RoleDropDown selectionOptions={selectionOptions} selectionHandler={selectionHandler} />
      {roleSelection === "PROPERTY MANAGER" && <div>
        <h1 className="section-title">PROPERTIES</h1>
        <div className="typeahead-section">
          <SearchPanel
            chips
            clearLabel="Clear search text"
            placeholder="Search Properties"
            small
            width={400}
            variant={SearchPanelVariant.checkbox}
            choices={propertySearchResults}
            value={propertySearchText}
            onSelectionChange={setPropertySelection}
            onChange={handlePropertySearch}
            onClear={handlePropertySearch}
            shadow
          />
          <button
            className="add-property-button"
            onClick={() => setShowAddProperty(!showAddProperty)}
            type="button"
          >
            <i className="fas fa-plus-circle icon-inline-space"></i>
          Create New Property
        </button>
        </div>
      </div>}
      <div className="mt-2">
        <button className="button is-small is-rounded is-primary mx-4"
          onClick={() => grantAccess()}
          disabled={roleSelection === ""}>
          GRANT ACCESS
        </button>
        <Link className="button is-rounded is-small is-dark" to='/dashboard'> CANCEL </Link>
      </div>
      {showAddProperty &&
        <Modal
          titleText="Create New Property"
          content={<AddProperty
            showPageTitle={false}
            postOnSubmit={getProperties}
            handleCancel={handleAddPropertyCancel}
            />}
          hasButtons={false}
          closeHandler={handleAddPropertyCancel}
        />
      }
    </div>
  );
};
