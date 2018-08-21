import React from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
// import EmergencyContactsList from '../../components/emergency/EmergencyContactsList';
// import EmergencyList from '../../components/emergency/EmergencyList';
import Header from '../../components/header/Header';
import Navigation from '../../components/navigation/Navigation';
import Tile from '../../components/tile/Tile';
import Accordion from '../../components/accordion/Accordion';
import Icon from '../../components/icon/Icon';
import { ROUTES } from '../../constants/constants';
import { ADMIN } from '../../translations/messages';

class Administration extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { intl } = this.props;
    return (
      <div className="admin page page--light">
        <Header>
          {() => (
            <div>
              <Navigation />
              <Header.Label label="Administration" type="basic" />
              <nav className="tabs">
                <div className="width-wrapper">
                  <ul>
                    <li className="tab">
                      <Link to={ROUTES.ADMIN_EMERGENCY}>
                        <strong>
                          <Icon icon="asterisk" />
                          {intl.formatMessage(ADMIN.EMERGENCY_NUMS_CREATE)}
                        </strong>
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            </div>
          )}
        </Header>

        <section className="main">
          <div className="width-wrapper">
            <h1>Admin Dashboard</h1>
            <div className="admin__tiles">
              <Tile
                title="Open Tickets"
                newTicketCount="4"
                unreadTicketCount="2" />
              <Tile
                title="Reports"
                newTicketCount="4"
                unreadTicketCount="2" />
              <Tile
                title="New PMs"
                newTicketCount="4"
                unreadTicketCount="2" />
            </div>
          </div>
        </section>
        <section className="main main--white">
          <div className="width-wrapper">
            <Accordion />
          </div>
        </section>
        {/* <section className="main width-wrapper">
          <EmergencyContactsList />
          <EmergencyList />
        </section> */}
      </div>
    );
  }
}

Administration.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Administration);
