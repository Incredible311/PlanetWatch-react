import React from 'react';
import { Dropdown, NavItem, NavLink } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import { withTranslation, WithTranslation } from 'react-i18next';
import { authorization } from '../authorization';

interface PwNavbarProps extends WithTranslation {
  username?: string
}

class PwNavbar extends React.Component<PwNavbarProps> {

  render() {
    const { t } = this.props;
    return (
      <>
        {/* <!-- Navbar --> */}
        <nav className='main-header navbar navbar-expand navbar-dark'>
          {/* <!-- Left navbar links --> */}
          <ul className='navbar-nav'>
            <li className='nav-item'>
              <Link to='#' onClick={() => document.body.classList.toggle('sidebar-collapse')} className='nav-link'><List /></Link>
            </li>
          </ul>

          {/* <!-- Right navbar links --> */}
          <ul className='navbar-nav ml-auto'>
            <Dropdown alignRight={true} as={NavItem}>
              <Dropdown.Toggle as={NavLink}>{this.props.username || ''}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => authorization.goToProfile()}>{t('PROFILE')}</Dropdown.Item>
                <Dropdown.Item onClick={() => authorization.logout()}>{t('LOGOUT')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </ul>
        </nav>
        {/* <!-- /.navbar --> */}
      </>
    );
  }

}

export default withTranslation()(PwNavbar);