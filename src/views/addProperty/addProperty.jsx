import React, { Component } from 'react';
import { Form, Field, Formik } from 'formik';
import * as Yup from 'yup';
import UserContext from '../../UserContext';
import * as axios from 'axios';
import { Link } from 'react-router-dom';
import Toast from '../../utils/toast';
import { SearchPanel, SearchPanelVariant } from 'react-search-panel';
import RoleEnum from '../../Enums/RoleEnum';
import './addProperty.scss';


const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, `*Name must have at least 5 characters`)
    .max(100, `*Names can't be longer than 100 characters`)
    .required(`*Name is required`),
  address: Yup.string()
    .max(250, `*Address can't be longer than 250 characters`)
    .required(`*Address is required`),
  city: Yup.string()
    .max(50, `*City can't be longer than 50 characters`)
    .required(`*City is required`),
  zipcode: Yup.string()
    .max(50, `*Zipcode can't be longer than 50 characters`)
    .required(`*Zipcode is required`),
  state: Yup.string()
    .max(50, `*State can't be longer than 50 characters`)
    .required(`*State is required`),
  num_units: Yup.string()
    .max(50, `*Unit can't be longer than 50 characters`),
  managers: Yup.array()
});

const formHandler = (data, context) => {
  axios.post('/api/properties', data, { headers: { 'Authorization': `Bearer ${context.user.accessJwt}` } })
    .then(function(response) {
      Toast('Property Added!', 'success');
    })
    .catch(function(error) {
      Toast(error.message, 'error');
    });
};

export class AddProperty extends Component {
  constructor(props) {
    super(props);

    this.state = {
      assignedPropertyManagers: [],
      managerOptions: [],
      managerSelection: [],
      managerSearch: ''
    };
    this.getManagers = this.getManagers.bind(this);
  }

  componentDidMount() {
    this.getManagers(this.context);
  };

  componentDidUpdate(prevProps, prevState) {
    if(this.state.managerSearch === prevState.managerSearch) return;

    let choices = this.state.managerOptions.filter(
      manager => manager.description.toLowerCase().includes(this.state.managerSearch.toLowerCase())
    );
    this.setState({ managerSelection: choices });
  }

  getManagers = (context) => {
    axios.get(`/api/user?r=${RoleEnum.PROPERTY_MANAGER}`, { headers: { 'Authorization': `Bearer ${context.user.accessJwt}` } })
      .then((response) => {
        const managerOptions = response.data.users.map(({ id, firstName, lastName }) => {
          return ({
            key: id,
            description: `${firstName} ${lastName}`
          });
        });
        this.setState({ managerOptions, managerSelection: managerOptions });
      })
      .catch((error) => {
        Toast(error.message, 'error');
        console.log(error);
      });
  };

  handleSearchChange = ({ target }) => {
    let managerSearch = target.value;
    if(!managerSearch || managerSearch.length === 0) managerSearch = '';
    this.setState({ managerSearch });
  };

  handleSelectionChange = (assignedPropertyManagers) => {
    this.setState({ assignedPropertyManagers });
  };

  static contextType = UserContext;
  render() {
    return (
      <UserContext.Consumer>
        {session => {
          return (
            <div className={`${this.props.showPageTitle ? 'main-container' :  ''}`}>
              <div>
                {this.props.showPageTitle && <h2 className='page-title'>Add a New Property</h2>}

                <Formik
                  initialValues={{
                    name: '',
                    address: '',
                    city: '',
                    state: '',
                    zipcode: '',
                    num_units: ''
                  }}
                  validationSchema={validationSchema}
                  onSubmit={(values, { setSubmitting, resetForm }) => {
                    values.propertyManagerIDs = this.state.assignedPropertyManagers.map(manager => manager.key);

                    console.log('submitting', values);
                    setSubmitting(true);
                    formHandler(values, session);
                    resetForm();
                    setSubmitting(false);
                  }}>
                  {({ handleSubmit, handleChange, values, errors, touched, isValid, isSubmitting }) => (
                    <div className='form-container add-property__main_container'>
                      <h1 className='section-title'>PROPERTY INFORMATION</h1>
                      <Form className='add-property__form-container' onSubmit={handleSubmit}>
                        <div className='form-row columns'>
                          <label className='column is-one-fifth' htmlFor='name'>Name</label>
                          <Field
                            className='column form-field'
                            type='text'
                            name='name'
                            onChange={handleChange}
                            value={values.name}
                            placeholder='Example Estate'
                          />
                          {errors.name ? (<div className='error-message'>{errors.name}</div>) : null}
                        </div>
                        <div className='form-row columns'>
                          <label className='column is-one-fifth' htmlFor='address'>Address</label>
                          <Field
                            className='column form-field'
                            type='text'
                            name='address'
                            onChange={handleChange}
                            value={values.address}
                            placeholder='123 Main St'
                            error={errors.address}
                          />
                          {errors.address ? (<div className='error-message'>{errors.address}</div>) : null}
                        </div>
                        <div className='form-row columns'>
                          <label className='column is-one-fifth' htmlFor='city'>City</label>
                          <Field
                            className='column form-field'
                            type='text'
                            name='city'
                            onChange={handleChange}
                            value={values.city}
                            placeholder='Portland'
                          />
                          {errors.city ? (<div className='error-message'>{errors.city}</div>) : null}
                        </div>
                        <div className='form-row columns'>
                          <label className='column is-one-fifth' htmlFor='state'>State</label>
                          <Field
                            className='column form-field'
                            type='text'
                            name='state'
                            onChange={handleChange}
                            value={values.state}
                            placeholder='OR'
                          />
                          {errors.state ? (<div className='error-message'>{errors.state}</div>) : null}
                        </div>
                        <div className='form-row columns'>
                          <label className='column is-one-fifth' htmlFor='zipcode'>Zipcode</label>
                          <Field
                            className='column form-field'
                            type='text'
                            name='zipcode'
                            onChange={handleChange}
                            value={values.zipcode}
                            placeholder='97217'
                          />
                          {errors.zipcode ? (<div className='error-message'>{errors.zipcode}</div>) : null}
                        </div>
                        <div className='form-row columns'>
                          <label className='column is-one-fifth' htmlFor='units'>Units</label>
                          <Field
                            className='column form-field'
                            type='text'
                            name='num_units'
                            onChange={handleChange}
                            value={values.num_units}
                            placeholder='Number of units'
                            error={errors.num_units}
                          />
                          {errors.num_units ? (<div className='error-message'>{errors.num_units}</div>) : null}
                        </div>

                        <div className=' add-property__assign-manager-container'>
                          <h3 className='section-title'>ASSIGN PROPERTY MANAGERS</h3>
                          <div className='typeahead-section'>
                            <SearchPanel
                              chips
                              choices={this.state.managerSelection}
                              small
                              width={400}
                              shadow
                              onChange={this.handleSearchChange}
                              onSelectionChange={this.handleSelectionChange}
                              placeholder='Search Property Managers'
                              selectedChoices={this.state.assignedPropertyManagers}
                              value={this.state.managerSearch}
                              variant={SearchPanelVariant.checkbox}
                            />
                          </div>
                        </div>
                        <div className='container-footer mt-3'>
                        <button
                          className='button is-primary is-rounded mr-5'
                          type='submit'
                          disabled={isSubmitting}>
                          SAVE
                        </button>
                        {typeof(this.props.handleCancel) === 'function'
                          ? <button
                              className='button is-dark is-rounded'
                              onClick={() => this.props.handleCancel()}
                              type='button'
                              >
                              CANCEL
                            </button>
                          : <Link
                            className='button is-dark is-rounded'
                            to='/manage/properties'
                          >
                            CANCEL
                          </Link>
                        }
                        </div>
                      </Form>

                    </div>
                  )}
                </Formik>
              </div>
            </div>
          );
        }}

      </UserContext.Consumer>
    );
  }
}
