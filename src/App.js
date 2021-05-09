import React from "react";
import 'react-toastify/dist/ReactToastify.min.css';
import "./App.scss";
import axios from 'axios';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { LoginForm } from "./views/login/login";
import SignupForm from "./views/signup/signup";
import { NavMenu } from "./views/NavigationMenu/navigationMenu";
import { Dashboard } from "./views/dashboard/dashboard";
import { RequestAccess } from "./views/requestAccess/requestAccess";
import { Properties } from "./views/properties/properties";
import Property from "./views/Property/PropertyView"
import { Tenants } from "./views/tenants/tenants";
import { Terms } from "./views/terms/terms";
import { Tickets } from "./views/tickets/tickets";
import Settings from "./views/Settings";
import ForgotPassword from "./views/ForgotPassword";
import EmergencyContacts from "./views/emergencyContacts/emergencyContacts";
import AddEmergencyContact from "./views/addEmergencyContact/addEmergencyContact";
import PrivacyPolicy from "./views/privacyPolicy/privacyPolicy";
import {
  PrivateRoute,
  auth,
  parseJwt,
  checkForStoredAccessToken,
  checkForStoredRefreshToken,
} from "./Auth";
import Header from "./components/Header/index";
import Footer from "./components/Footer/index";
import { AddProperty } from "./views/addProperty/addProperty";
import Managers from "./views/managers/managers";
import Manager from "./views/Manager";
import { JoinStaff } from "./views/joinStaff/joinStaff";
import { AddStaffMember } from "./views/addStaffMember/addStaffMember";
import { AddTenant } from "./views/AddTenant/addTenant";
import { AddManager } from './views/addManager/addManager';
import UserContext from "./UserContext";
import Tenant from "./views/Tenant";
import ChangePassword from "./views/Settings/changePassword";
import { ToastContainer } from 'react-toastify';
import NoMatch from "./views/noMatch/noMatch";
import { AddTicket } from "./views/AddTicket/addTicket";

var refreshTimeout;

export class App extends React.Component {
  constructor(props) {
    super(props);

    if (checkForStoredAccessToken()) {
      let parsedJwt = parseJwt(window.localStorage['dwellinglyAccess']);
      this.state = {
        userSession: {
          isAuthenticated: true,
          accessJwt: window.localStorage["dwellinglyAccess"],
          refreshJwt: window.localStorage["dwellinglyRefresh"],
          identity: parsedJwt.sub,
          firstName: parsedJwt.firstName,
          lastName: parsedJwt.lastName,
          email: parsedJwt.email,
          phone: parsedJwt.phone
        }
      };
    }
    else {
      this.state = {
        userSession: {
          isAuthenticated: false,
          accessJwt: '',
          refreshJwt: '',
          identity: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
        }
      };
    }
  }

  componentDidMount() {
    if (checkForStoredAccessToken()) {
      let parsedJwt = parseJwt(window.localStorage['dwellinglyAccess']);
      this.setState(
        {
          userSession: {
            isAuthenticated: true,
            accessJwt: window.localStorage["dwellinglyAccess"],
            refreshJwt: window.localStorage["dwellinglyRefresh"],
            identity: parsedJwt.sub,
            firstName: parsedJwt.firstName,
            lastName: parsedJwt.lastName,
            email: parsedJwt.email,
            phone: parsedJwt.phone
          },
        },
        () => {
          this.refreshJwtPeriodically();
        }
      );
    } else if (checkForStoredRefreshToken()) {
      this.refreshJwtPeriodically();
    }
  }

  setUser = (newContext) => {
    return this.setState(newContext);
  };

  login = (email, password) => {
    auth.authenticate(email, password)
      .then(response => {
        if (response) {
          window.localStorage['dwellinglyAccess'] = response.data.access_token;
          window.localStorage['dwellinglyRefresh'] = response.data.refresh_token;
          let parsedJwt = parseJwt(response.data.access_token);
          this.setState({
            userSession: {
              isAuthenticated: true,
              accessJwt: response.data.access_token,
              refreshJwt: response.data.refresh_token,
              identity: parsedJwt.sub,
              firstName: parsedJwt.firstName,
              lastName: parsedJwt.lastName,
              email: parsedJwt.email,
              phone: parsedJwt.phone
            }
          }, () => {
            // Call to refresh the access token 3 minutes later
            setTimeout(this.refreshJwtPeriodically, 180000);
            this.updateAxiosDefaults();
          });
        } else {
          this.notify('Failed to login', 'warn');
        }
      });
  };

  refreshJwtPeriodically = () => {
    auth.refreshAccess(window.localStorage['dwellinglyRefresh'])
      .then((response) => {
        this.setState({
          userSession: {
            ...this.state.userSession,
            isAuthenticated: true,
            accessJwt: response.data.access_token,
            /*
            userId: parsedJwt.userId,
            userFirst: parsedJwt.userFirst,
            userLast: parsedJwt.userLast,
            userEmail: parsedJwt.userEmail
            */
          }
        }, () => {
          refreshTimeout && clearTimeout(refreshTimeout);
          // Call to refresh the access token 3 minutes later
          setTimeout(this.refreshJwtPeriodically, 180000);
          this.updateAxiosDefaults();
        });
        localStorage.setItem("dwellinglyAccess", response.data.access_token);
      })
      .catch(error => {
        console.log("Failed to refresh access token: " + error);
      });
  };

  logout = () => {
    auth.signout()
      .then(() => {
        this.setState({
          userSession: {
            isAuthenticated: false,
            accessJwt: '',
            refreshJwt: '',
            identity: '',
            firstName: '',
            lastName: '',
            email: ''
          }
        }, () => {
          window.location.replace('/login');
        });
      });
  };

  /**
   * Configure defaults for all axios requests in the App
   */
  updateAxiosDefaults = () => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.state.userSession.accessJwt}`;
  };

  render() {
    return (
      <UserContext.Provider value={{ user: { ...this.state.userSession }, handleSetUser: this.setUser, refreshJWT: this.refreshJwtPeriodically, login: this.login, logout: this.logout }} >
        <BrowserRouter>
          <div className='App'>
            {this.state.userSession.isAuthenticated
              && <><NavMenu />
                <Header /></>}

            <Switch>
              <Route exact path='/login' component={LoginForm} />
              <Route exact path='/signup' component={SignupForm} />
              <Route exact path='/terms' component={Terms} />
              <Route exact path='/privacypolicy' component={PrivacyPolicy} />
              <Route exact path='/forgot-password' component={ForgotPassword} />
              <PrivateRoute exact path='/' component={() => <Redirect to="/dashboard" />} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
              <PrivateRoute exact path='/home' component={() => <Redirect to="/dashboard" />} />
              <PrivateRoute exact path='/add/tenant' component={AddTenant} />
              <PrivateRoute exact path='/add/property' component={() => <AddProperty showPageTitle={true}/>} />
              <PrivateRoute exact path='/add/manager' component={AddManager} />
              <PrivateRoute exact path='/add/ticket' component={AddTicket} />
              <PrivateRoute exact path='/manage/tenants' component={Tenants} />
              <PrivateRoute exact path='/manage/tenants/:id' component={Tenant} />
              <PrivateRoute exact path='/add/emergencycontact' component={AddEmergencyContact} />
              <PrivateRoute exact path='/edit/emergencycontact/:id' component={AddEmergencyContact} />
              <PrivateRoute exact path='/manage/properties' component={Properties} />
              <PrivateRoute exact path='/manage/properties/:id' component={Property} />
              <PrivateRoute exact path='/manage/managers' component={Managers} />
              <PrivateRoute exact path='/manage/managers/:id' component={Manager} />
              <PrivateRoute exact path='/manage/tickets' component={Tickets} />
              <PrivateRoute exact path='/staff' component={JoinStaff} />
              <PrivateRoute exact path='/staff/add' component={AddStaffMember} />
              <PrivateRoute exact path='/emergency' component={EmergencyContacts} />
              <PrivateRoute exact path='/settings' component={Settings} />
              <PrivateRoute exact path='/changePassword' component={ChangePassword} />
              <PrivateRoute exact path='/request-access/:id' component={RequestAccess} />
              <Route path='*' component={NoMatch} />
            </Switch>
            {this.state.userSession.isAuthenticated
              && <Footer />}
          </div>
        </BrowserRouter>
        <ToastContainer
          position="bottom-right"
          toastClassName="toast"
          pauseOnFocusLoss
          autoClose={4000}
          hideProgressBar
          pauseOnHover
          closeOnClick
          newestOnTop
          rtl={false}
          draggable
        />
      </UserContext.Provider>
    );
  }
}

export default App;
