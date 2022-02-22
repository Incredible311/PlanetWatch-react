import SensorsList from '../Components/SensorsList';
import AddContact from '../Contacts/AddContact/addContact';
import Contacts from '../Contacts/contacts';
import Kyc from '../kyc/kyc';
import Licenses from '../Licenses/licenses';
import LicensesHistory from '../Licenses/LicensesHistory/licensesHistory';
import ClientRole from '../Model/clientRole';
import RouteModel from '../Model/routeModel';
import OrderForm from '../Purchases/orderForm';
import Purchases from '../Purchases/purchases';
import AddSensors from '../Sensors/AddSensors/addSensors';
import Sensors from '../Sensors/sensors';
import SensorsOwners from '../Sensors/sensorsOwners';
import TempSensors from '../Sensors/tempSensors';
import ChangeAccount from '../Support/ChangeAccount/changeAccount';
import Clawback from '../Support/Clawback/clawback';
import MergeAccount from '../Support/MergeAccount/mergeAccount';
import NftMove from '../Support/NftMove/nftMove';
import TransactionsList from '../Transactions/transactionsList';
import Dashboard from './dashboard';

export const routeHome: RouteModel = {
  path: '/',
  component: Dashboard,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeAirquino: RouteModel = {
  path: '/sensors/airqino',
  component: SensorsList,
  forRealm: false,
  roles: [ClientRole.AIRQINO]
};
export const routeAddSensor: RouteModel = {
  path: '/add',
  component: AddSensors,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeSensors: RouteModel = {
  path: '/sensors',
  component: Sensors,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeTempSensors: RouteModel = {
  path: '/tempSensors',
  component: TempSensors,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeContacts: RouteModel = {
  path: '/contacts',
  component: Contacts,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeAddContact: RouteModel = {
  path: '/addContacts',
  component: AddContact,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeOwners: RouteModel = {
  path: '/owners',
  component: SensorsOwners,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeKyc: RouteModel = {
  path: '/kyc',
  component: Kyc,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routePurchases: RouteModel = {
  path: '/purchases',
  component: Purchases,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeAddPurchase: RouteModel = {
  path: '/purchases/0',
  component: OrderForm,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routePurchase: RouteModel = {
  path: '/purchases/:id',
  component: OrderForm,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeLicenses: RouteModel = {
  path: '/licenses',
  component: Licenses,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeLicensesHistory: RouteModel = {
  path: '/licenses/history',
  component: LicensesHistory,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeChangeAccount: RouteModel = {
  path: '/changeAccount',
  component: ChangeAccount,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeNftMove: RouteModel = {
  path: '/nftMove',
  component: NftMove,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeClawback: RouteModel = {
  path: '/clawback',
  component: Clawback,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const transactions: RouteModel = {
  path: '/transactions',
  component: TransactionsList,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};
export const routeMergeAccount: RouteModel = {
  path: '/mergeAccount',
  component: MergeAccount,
  forRealm: false,
  roles: [ClientRole.ADMIN]
};

const routes: RouteModel[] = [
  routeAirquino,
  routeHome,
  routeAddSensor,
  routeSensors,
  routeTempSensors,
  routeContacts,
  routeAddContact,
  routeOwners,
  routeKyc,
  routePurchases,
  routeAddPurchase,
  routePurchase,
  routeLicenses,
  routeChangeAccount,
  routeNftMove,
  routeClawback,
  transactions,
  routeLicensesHistory,
  routeMergeAccount
];

export default routes;