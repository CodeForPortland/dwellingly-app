import React from 'react';
import './App.scss';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { LoginForm } from './views/login';
import { Home } from './views/home';
import { Dashboard } from './views/dashboard';
import { Terms } from './views/terms';
import { PrivateRoute, auth } from './Auth';
import Header from './components/Header/index';

export const UserContext = React.createContext();

const parseJwt = ( token ) => {
  var base64Payload = token.split( '.' )[1];
  var base64 = base64Payload.replace( '-', '+' ).replace( '_', '/' );
  return JSON.parse( atob( base64 ) );
}

export class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userSession: {
        isAuthenticated: false,
        accessJwt: '',
        refreshJwt: '',
        userId: '',
        userFirst: '',
        userLast: '',
        userEmail: ''
      }
    }
  }

  componentDidMount() {
    if( this.checkForStoredAccessToken() ) {
      this.setState({
        userSession: {
          isAuthenticated: true,
          accessJwt: window.localStorage[ 'dwellinglyAccess' ],
          refreshJwt: window.localStorage[ 'dwellinglyRefresh' ],
        }
      });
    } else if( this.checkForStoredRefreshToken() ) {
      //refresh access token using refresh token
      console.log("Valid refresh token found");
    }
  }

  checkForStoredAccessToken = () => {
    var token = window.localStorage[ 'dwellinglyAccess' ];
    if(token) {
      var parsedToken = parseJwt(token);
      if(parsedToken.exp * 1000 > Date.now()) {
        return true;
      }
    }
    return false;
  }

  checkForStoredRefreshToken = () => {
    var token = window.localStorage[ 'dwellinglyRefresh' ];
    if(token) {
      var parsedToken = parseJwt(token);
      if(parsedToken.exp > Date.now()) {
        return true;
      }
    }
    return false;
  }

  login = (username, password) => {
    auth.authenticate(username, password)
      .then( response => {
        if (response) {
          window.localStorage[ 'dwellinglyAccess' ] = response.data.access_token;
          window.localStorage[ 'dwellinglyRefresh' ] = response.data.refresh_token;
          //let parsedJwt = parseJwt(response.access_token);
          this.setState({
            userSession: {
              isAuthenticated: true,
              accessJwt: response.data.access_token,
              refreshJwt: response.data.refresh_token,
              /*
              userId: parsedJwt.userId,
              userFirst: parsedJwt.userFirst,
              userLast: parsedJwt.userLast,
              userEmail: parsedJwt.userEmail
              */
            }
          });
        }
      })
    .catch( (error) => {
      alert("Failed to login");
    })
  }

  logout = () => {
    auth.signout()
      .then( () => {
        this.setState({
          userSession: {
            isAuthenticated: false,
            accessJwt: '',
            refreshJwt: '',
            userId: '',
            userFirst: '',
            userLast: '',
            userEmail: ''
          }
        })
        window.location.replace('/login');
      });
  }

  render() {
    return (
      <UserContext.Provider value={{ user: { ...this.state.userSession }, login: this.login, logout: this.logout }} >
        <BrowserRouter>
          <div className='App'>
            <Header />

            <Switch>
              <PrivateRoute exact path='/' component={Dashboard} />
              <Route exact path='/login' component={LoginForm} />
              <PrivateRoute exact path='/dashboard' component={Dashboard} />
              <Route exact path='/terms' component={Terms} />
            </Switch>
          </div>
        </BrowserRouter>
      </UserContext.Provider>
    );
  }
}

export default App;
