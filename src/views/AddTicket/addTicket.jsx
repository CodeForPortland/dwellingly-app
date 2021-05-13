import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { SearchPanel, SearchPanelVariant } from "react-search-panel";
import RoleEnum from '../../Enums/RoleEnum';
import Toast from '../../utils/toast';
import * as axios from "axios";
import UserContext from "../../UserContext";
import './addTicket.scss';

const makeAuthHeaders = ({ user }) => ({ headers: { 'Authorization': `Bearer ${user.accessJwt}` } });

export const AddTicket = () => {
  const context = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [staffSearchText, setStaffSearchText] = useState("");
  const [staffSearchResults, setStaffSearchResults] = useState([]);
  const [staffSelection, setStaffSelection] = useState();
  const [tenantSearchText, setTenantSearchText] = useState("");
  const [tenantSearchResults, setTenantSearchResults] = useState([]);
  const [tenantSelection, settenantSelection] = useState();
  const [issueText, setIssueText] = useState("");
  const [urgency, setUrgency] = useState("");

  useEffect(() => {
    axios.post("/api/users/role", {
      userrole: RoleEnum.STAFF,
      name: staffSearchText
    }, makeAuthHeaders(context))
      .then(staffResponse => {
        let users = staffResponse.data.users;
        let choices = users
          ? users.map(u => {
            return { key: u.id, description: `${u.firstName} ${u.lastName}` };
          })
          : [];
        setStaffSearchResults(choices);
      })
      .catch(error => {
        Toast(error.message, "error");
      });
  }, [staffSearchText]);

  /**
   * Handle staff search input
   * @param {*} event
   */
  const handleStaffSearch = (event) => {
    const { value } = event.target;
    if(!value || value.length === 0) {
      setStaffSearchResults([]);
      setStaffSearchText("");
    } else {
      setStaffSearchText(value);
    }
  };

  /**
   * Handle change in staff selection of search panel
   * @param {*} selectedChoice
   */
  const handleChangestaffSelection = (selectedChoice) => {
    setStaffSelection(selectedChoice);
  };

  useEffect(() => {
    axios.get("/api/tenants", makeAuthHeaders(context))
      .then(tenantResponse => {
        let tenants = tenantResponse.data.tenants;
        let choices = tenants
          ? tenants.map(t => {
            return { key: t.id, description: `${t.firstName} ${t.lastName}` };
          })
          : [];
        setTenantSearchResults(choices);
      })
      .catch(error => {
        Toast(error.message, "error");
      });
  }, [tenantSearchText]);

  /**
   * Handle staff search input
   * @param {*} event
   */
  const handleTenantSearch = (event) => {
    const { value } = event.target;
    if(!value || value.length === 0) {
      setTenantSearchResults([]);
      setTenantSearchText("");
    } else {
      setTenantSearchText(value);
    }
  };

  /**
   * Handle change in tenant selection of search panel
   * @param {*} selectedChoice
   */
  const handleChangeTenantSelection = (selectedChoice) => {
    clearError("tenant");
    settenantSelection(selectedChoice);
  };

  const handleChangeUrgency = (e) => {
    clearError("urgency");
    setUrgency(e.target.value);
  };

  const handleChangeIssue = (e) => {
    clearError("issueText");
    setIssueText(e.target.value);
  };

  const validateData = () => {
    var hasErrors = false;
    if(!errors.includes("issueText") && !issueText) {
      hasErrors = true;
      setErrors(errors => [...errors, "issueText"]);
    }
    if(!errors.includes("urgency") && !urgency) {
      hasErrors = true;
      setErrors(errors => [...errors, "urgency"]);
    }
    if(!errors.includes("tenant") && !tenantSelection || tenantSelection.length < 1) {
      hasErrors = true;
      setErrors(errors => [...errors, "tenant"]);
    }
    if(hasErrors) {
      return Promise.reject();
    }
    else {
      return Promise.resolve();
    }
  };
  
  const submitTicket = () => {
    setIsSubmitting(true);

    validateData()
      .then( () => {
        var data = {
          assignedUserID: (staffSelection && staffSelection.length > 0) ? staffSelection[0].key : null,
          issue: issueText,
          senderID: context.user.identity,
          status: "New",
          tenantID: tenantSelection[0].key,
          urgency: urgency
        };
        axios.post('/api/tickets', data, makeAuthHeaders(context))
          .then(response => {
            setErrors([]);
            setIsSubmitting(false);
            Toast('Ticket successfully created!', 'success');
          })
          .catch(error => {
            setIsSubmitting(false);
            Toast(error.message, 'error');
          });
      })
      .catch( () => {
        setIsSubmitting(false);
      })
  };

  const clearError = (error) => {
    setErrors(errors => errors.filter(err => err !== error));
  }

  return (
    <div className="main-container">
      <div className="section-header">
        <h2 className="page-title">Add a New Ticket</h2>
      </div>
      <div className="add-ticket">
        <div className="form-container">
          <div className="form-section">
            <h2 className="section-title">ISSUE
            {errors.includes("issueText") && <span className='error-message'> * Issue description is required</span>}</h2>
            <div className='form-row'>
              <input
                className='column form-field'
                type='text'
                name='issue'
                onChange={handleChangeIssue}
                value={issueText}
                placeholder='Unpaid rent'
              />
            </div>
          </div>
          <div className="form-section">
            <h2 className="section-title">URGENCY
            {errors.includes("urgency") && <span className='error-message'> * Urgency is required</span>}</h2>
            <div className="bordered-section">
              <input type="radio" id="high" name="high"
                checked={urgency === 'high'}
                onChange={handleChangeUrgency}
                value="high" />
              <label htmlFor="high">High</label><br/>
              <input type="radio" id="medium" name="medium"
                checked={urgency === 'medium'}
                onChange={handleChangeUrgency}
                value="medium" />
              <label htmlFor="medium">Medium</label><br/>
              <input type="radio" id="low" name="low"
                checked={urgency === 'low'}
                onChange={handleChangeUrgency}
                value="low" />
              <label htmlFor="low">Low</label>
            </div>
          </div>
          <div className="form-section">
            <h2 className="section-title">ASSIGN JOIN STAFF</h2>
            <div className="typeahead-section">
              <SearchPanel
                chips
                choices={staffSearchResults}
                clearLabel="Clear search text"
                onChange={handleStaffSearch}
                onClear={handleStaffSearch}
                onSelectionChange={handleChangestaffSelection}
                placeholder="Search JOIN staff"
                preSelectedChoices={staffSelection}
                small
                value={staffSearchText}
                variant={SearchPanelVariant.radio}
                width={400}
                shadow
              />
            </div>
          </div>
          <div className="form-section">
            <h2 className="section-title">TENANTS
            {errors.includes("tenant") && <span className='error-message'> * Please select a tenant</span>}</h2>
            <div className="typeahead-section">
              <SearchPanel
                chips
                choices={tenantSearchResults}
                clearLabel="Clear search text"
                onChange={handleTenantSearch}
                onClear={handleTenantSearch}
                onSelectionChange={handleChangeTenantSelection}
                placeholder="Search Tenants"
                preSelectedChoices={tenantSelection}
                small
                value={tenantSearchText}
                variant={SearchPanelVariant.radio}
                width={400}
                shadow
              />
            </div>
          </div>
          <div className="button-container">
            <Button
              isCancelButton={false}
              type="submit"
              disabledFlag={isSubmitting}
              isValidFlag={true}
              onClick={submitTicket}
            >
              SAVE
            </Button>
            <Link
              className="button is-dark is-rounded"
              to="/manage/tickets"
            >
              CANCEL
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
