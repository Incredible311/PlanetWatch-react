import crypto from 'crypto';
import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import {
  ArrowLeftRight, ArrowsMove, Cart, CartPlusFill, ChevronDown, ClockHistory, Cpu, FilePerson,
  FilePlus,
  House, List, People,
  PeopleFill,
  // Key,
  // PersonBadge,
  PersonFill,
  PersonLinesFill, PersonPlusFill,
  Phone,
  PhoneLandscape,
  PhoneVibrate, Unlock, UnlockFill
} from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { authorization } from '../authorization';
import NavItem from '../Model/navItemModel';
import {
  routeAddContact, routeAddPurchase, routeAddSensor, routeAirquino,
  routeChangeAccount, routeClawback, routeContacts, routeHome,
  routeLicenses, routeLicensesHistory, routeMergeAccount, routeNftMove, routeOwners, routePurchases, routeSensors,
  routeTempSensors, transactions
} from '../Routes/routes';

function menuIsEmpty(item: NavItem): boolean {
  const items = item.children || [];
  for (let i = 0; i < items.length; i += 1) {
    const subitem = items[i];
    const itemCheck = authorization.isAuthorized(subitem?.roles, subitem?.forRealm);
    if (itemCheck) {
      console.log('menuIsEmpty false', item);
      return false;
    }
  }
  console.log('menuIsEmpty true', item);
  return true;
}

// TODO: make generics... row passed as props!
const PwSidebarNoRouter = (props: any) => {
  const [menuContactOpen, setMenuContactOpen] = useState(false);
  const [menuSensorsOpen, setMenuSensorsOpen] = useState(false);
  const [menuLicenseOpen, setMenuLicenseOpen] = useState(false);
  const [menuPurchasesOpen, setMenuPurchasesOpen] = useState(false);
  const [menuAccountOpen, setMenuAccountOpen] = useState(false);
  const { t } = useTranslation();
  const mail = authorization.userProfile()?.email;
  let avatarUrl;
  if (mail !== undefined && mail !== null) {
    const md5Crypto = crypto.createHash('md5');
    const hashData = md5Crypto.update(mail, 'utf-8');
    const hashStr = hashData.digest('hex');
    avatarUrl = `https://www.gravatar.com/avatar/${hashStr}?d=robohash`;
  }

  const MENUS: NavItem[] = [
    {
      ...routeHome,
      text: 'HOME',
      icon: House
    },
    {
      path: '#',
      text: 'PURCHASES',
      forRealm: true,
      icon: Cart,
      className: `has-treeview ${menuPurchasesOpen ? 'menu-open' : ''}`,
      onClick: () => setMenuPurchasesOpen(!menuPurchasesOpen),
      roles: [],
      children: [
        {
          ...routePurchases,
          text: 'PURCHASES_LIST',
          icon: List
        },
        {
          ...routeAddPurchase,
          text: 'ADD_PURCHASE',
          icon: CartPlusFill
        },
        {
          ...transactions,
          text: 'TRANSACTIONS_LIST',
          icon: ArrowLeftRight
        }
      ]
    },
    {
      path: '#',
      text: 'CONTACTS',
      icon: PersonFill,
      forRealm: true,
      roles: [],
      className: `has-treeview ${menuContactOpen ? 'menu-open' : ''}`,
      onClick: () => setMenuContactOpen(!menuContactOpen),
      children: [
        {
          ...routeContacts,
          text: 'CONTACTS_LIST',
          icon: PersonLinesFill
        },
        {
          ...routeAddContact,
          text: 'ADD_CONTACT',
          icon: PersonPlusFill
        }
      ]
    },
    {
      path: '#',
      text: 'SENSORS',
      icon: Phone,
      forRealm: true,
      roles: [],
      className: `has-treeview ${menuSensorsOpen ? 'menu-open' : ''}`,
      onClick: () => setMenuSensorsOpen(!menuSensorsOpen),
      children: [
        {
          ...routeOwners,
          text: 'SENSORS_OWNERS',
          icon: FilePerson
        },
        {
          ...routeSensors,
          text: 'LIVE_SENSORS',
          icon: PhoneVibrate
        },
        {
          ...routeAirquino,
          text: 'AIRQINO_TESTING',
          icon: Cpu
        },
        {
          ...routeTempSensors,
          text: 'TEMPORARY_SENSORS',
          icon: PhoneLandscape
        },
        {
          ...routeAddSensor,
          text: 'ADD_SENSORS',
          icon: FilePlus
        }
      ]
    },
    {
      path: '#',
      text: 'Licenses',
      icon: Unlock,
      forRealm: true,
      roles: [],
      className: `has-treeview ${menuLicenseOpen ? 'menu-open' : ''}`,
      onClick: () => setMenuLicenseOpen(!menuLicenseOpen),
      children: [
        {
          ...routeLicenses,
          text: 'Live Licenses',
          icon: UnlockFill
        },
        {
          ...routeLicensesHistory,
          text: 'Licenses History',
          icon: ClockHistory
        }
      ]
    },
    {
      path: '#',
      text: 'Support',
      icon: People,
      forRealm: true,
      roles: [],
      className: `has-treeview ${menuAccountOpen ? 'menu-open' : ''}`,
      onClick: () => setMenuAccountOpen(!menuAccountOpen),
      children: [
        {
          ...routeChangeAccount,
          text: 'Change Account',
          icon: PeopleFill
        },
        {
          ...routeNftMove,
          text: 'Nft Move',
          icon: ArrowsMove
        },
        {
          ...routeClawback,
          text: 'Clawback',
          icon: ArrowsMove
        },
        {
          ...routeMergeAccount,
          text: 'Merge Account',
          icon: PersonPlusFill
        }
      ]
    }
  ];

  return (
    <aside className='main-sidebar sidebar-dark-primary elevation-4 sidebar-no-expand' >
      {/* < !--Brand Logo-- > */}
      <a href='/' className='brand-link'>
        <img src='favicon.svg' alt='Logo' className='brand-image img-circle elevation-3' />
        <span className='brand-text font-weight-light'>{t('BRAND_NAME')}</span>
      </a>

      {/* <!-- Sidebar --> */}
      <div className='sidebar'>
        {/* <!-- Sidebar user panel (optional) --> */}
        <div className='user-panel mt-3 pb-3 mb-3 d-flex'>
          <div className='image'>
            <img src={avatarUrl} className='img-circle elevation-2' alt='avatar' />
          </div>
          <div className='info text-light'>
            {props.username}
          </div>
        </div>

        {/* <!-- Sidebar Menu --> */}
        <nav className='mt-2'>
          <ul className='nav nav-pills nav-sidebar flex-column nav-child-indent' data-widget='treeview' role='menu'>

            {
              MENUS.map((item) => <>
                {
                  authorization.isAuthorized(item.roles, item.forRealm) &&
                  (!item.children || (item.children.length && !menuIsEmpty(item))) &&
                  <Nav.Item className={item.className} key={item.text}>
                    <Link to={item.path} className='nav-link' onClick={item.onClick}>
                      <item.icon className='nav-icon' />
                      <p> {t(item.text)}
                        {
                          item.children && item.children.length &&
                          <ChevronDown className='right' />
                        }
                      </p>
                    </Link>
                    {
                      item.children &&
                      <ul className='nav nav-treeview'>
                        {
                          item.children.map((subitem) => <>
                            {
                              authorization.isAuthorized(
                                subitem.roles,
                                subitem.forRealm
                              ) &&
                              <Nav.Item className={subitem.className} onClick={subitem.onClick} key={subitem.text}>
                                <Link to={subitem.path} className='nav-link'>
                                  <subitem.icon className='nav-icon' />
                                  <p> {t(subitem.text)}</p>
                                </Link>
                              </Nav.Item>
                            }
                          </>)
                        }
                      </ul>
                    }
                  </Nav.Item>
                }
              </>)
            }
          </ul>
        </nav>

        {/* <!-- /.sidebar-menu --> */}
      </div>
      {/* <!-- /.sidebar --> */}
    </aside >
  );
};

const PwSidebar = withRouter(PwSidebarNoRouter);
export default PwSidebar;