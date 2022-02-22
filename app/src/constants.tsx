import Constants from './Model/constants';

/* eslint-disable i18next/no-literal-string */
const constants: Constants = {
  sensors_type: {
    atmotube: {
      key: 'Atmotube',
      value: 'AB'
    },
    airly_pm: {
      key: 'Airly PM',
      value: 'AP'
    },
    airly_pm_no2_03: {
      key: 'Airly PM + Gas (NO2, O3)',
      value: 'A1'
    },
    airly_pm_so2_co: {
      key: 'Airly PM + Gas (SO2, CO)',
      value: 'A2'
    },
    wiseair: {
      key: 'Wiseair',
      value: 'WA'
    },
    awair: {
      key: 'Awair',
      value: 'AW',
      calibration_params: [
        { name: 'latitude', type: 'number' },
        { name: 'longitude', type: 'number' }
      ]
    },
    airqino: {
      key: 'Airqino',
      value: 'AQ',
      calibration_params: [
        {
          name: 'co',
          type: 'object',
          children: [
            { name: 'a', type: 'number', default: 0.33 },
            { name: 'b', type: 'number', default: -1.655 }
          ]
        },
        {
          name: 'pm10',
          type: 'object',
          children: [
            { name: 'a', type: 'number', default: 0.9375 },
            { name: 'b', type: 'number', default: 0.682 }
          ]
        },
        {
          name: 'o3',
          type: 'object',
          children: [
            { name: 'a', type: 'number', default: 22.524 },
            { name: 'b', type: 'number', default: -52.628 }
          ]
        },
        {
          name: 'pm25',
          type: 'object',
          children: [
            { name: 'a', type: 'number', default: 1.1225 },
            { name: 'b', type: 'number', default: 0.983 }
          ]
        },
        {
          name: 'no2',
          type: 'object',
          children: [
            { name: 'a', type: 'number', default: 0.965 },
            { name: 'b', type: 'number', default: 0.56 }
          ]
        }
      ]
    }
  },
  keycloak: {
    url: process.env.REACT_APP_KEYCLOAK_URL!,
    realm: process.env.REACT_APP_KEYCLOAK_REALM!,
    clientId: 'pw-sensors',
    role: 'pw-sensors'
  },
  api: {
    base: `${process.env.REACT_APP_BASE_URL}/api`,
    getAggregate3Days: `${process.env.REACT_APP_BASE_URL}/api/stats/aggregate/3days`,
    getDashboard: `${process.env.REACT_APP_BASE_URL}/api/sensors/dashboard`, // GET
    getAccountsDashboard: `${process.env.REACT_APP_BASE_URL}/api/algorand/dashboard`, // GET
    getMySensors: `${process.env.REACT_APP_BASE_URL}/api/sensors/my`, // GET
    getSensors: `${process.env.REACT_APP_BASE_URL}/api/sensors/`, // GET
    getTempSensors: `${process.env.REACT_APP_BASE_URL}/api/sensors/temporary`, // GET
    addSensors: `${process.env.REACT_APP_BASE_URL}/api/sensors/`, // POST
    getContacts: `${process.env.REACT_APP_BASE_URL}/api/contacts/contacts`,
    getContact: `${process.env.REACT_APP_BASE_URL}/api/contacts`,
    getLocationsByContact: `${process.env.REACT_APP_BASE_URL}/api/contacts/locations/mail/`, // GET,
    getOrders: `${process.env.REACT_APP_BASE_URL}/api/orders`, // GET,
    getOrder: `${process.env.REACT_APP_BASE_URL}/api/orders`, // GET,
    getPersonalContacts: `${process.env.REACT_APP_BASE_URL}/api/contacts/personal`, // GET
    addPersonalContact: `${process.env.REACT_APP_BASE_URL}/api/contacts/personal`, // POST
    getBusinessContacts: `${process.env.REACT_APP_BASE_URL}/api/contacts/business`, // GET
    getBusinessContactDetail: `${process.env.REACT_APP_BASE_URL}/api/contacts/business/{id}`, // GET
    addBusinessContactLink: `${process.env.REACT_APP_BASE_URL}/api/contacts/business/{businessId}/{personalId}`, // POST
    deleteBusinessContactLink: `${process.env.REACT_APP_BASE_URL}/api/contacts/business/{businessId}/{personalId}`, // DELETE
    addBusinessContact: `${process.env.REACT_APP_BASE_URL}/api/contacts/business`, // POST
    getAlgorandAccounts: `${process.env.REACT_APP_BASE_URL}/api/contacts/algoaccounts`, // GET
    getSensorsOwners: `${process.env.REACT_APP_BASE_URL}/api/sensors/owners`, // GET
    promoteSensor: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/promote`,
    addOwnerPersonalDeviceLink: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/owner/personal/{personalId}`, // POST
    addOwnerBusinessDeviceLink: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/owner/business/{businessId}`, // POST
    deleteOwnerPersonalDeviceLink: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/owner/personal`, // DELETE
    deleteOwnerBusinessDeviceLink: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/owner/business`, // DELETE
    addInfrastructurePersonalDeviceLink:
      `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/infrastructure/personal/{personalId}`, // POST
    addInfrastructureBusinessDeviceLink:
      `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/infrastructure/business/{businessId}`, // POST
    deleteInfrastructurePersonalDeviceLink: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/infrastructure/personal`, // DELETE
    deleteInfrastructureBusinessDeviceLink: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/infrastructure/business`, // DELETE
    refreshKycOnboarding: `${process.env.REACT_APP_BASE_URL}/api/kyc/{id}/refresh`, // GET
    getKycInfos: `${process.env.REACT_APP_BASE_URL}/api/kyc/dashboard`,
    initKycAccount: `${process.env.REACT_APP_BASE_URL}/api/kyc/init/{email}`,
    getBetatesters: `${process.env.REACT_APP_BASE_URL}/api/betatesters/`, // GET
    addBetatester: `${process.env.REACT_APP_BASE_URL}/api/betatesters/`, // POST
    fixPin: `${process.env.REACT_APP_BASE_URL}/api/sensors/{sensorId}/fixpin`, // PUT
    addOrder: `${process.env.REACT_APP_BASE_URL}/api/orders/order`, // POST
    getSensorFEHistory: `${process.env.REACT_APP_BASE_URL}/api/airquino/sensor`, // GET
    getSensorsFE: `${process.env.REACT_APP_BASE_URL}/api/airquino/sensors`, // GET
    getPurchasesCounts: `${process.env.REACT_APP_BASE_URL}/api/orders/count`, // GET
    getProductTypes: `${process.env.REACT_APP_BASE_URL}/api/productTypes`, // GET
    getPaymentTypes: `${process.env.REACT_APP_BASE_URL}/api/paymentTypes`, // GET
    addOrderFull: `${process.env.REACT_APP_BASE_URL}/api/orders/full-order`, // POST
    deleteOrder: `${process.env.REACT_APP_BASE_URL}/api/orders`, // POST
    updateOrderFull: `${process.env.REACT_APP_BASE_URL}/api/orders/full-order`, // PUT
    getExportOrders: `${process.env.REACT_APP_BASE_URL}/api/orders/export`, // GET
    deleteDeviceOwner: `${process.env.REACT_APP_BASE_URL}/api/support/devices/{deviceId}/sold`, // POST
    getLicenses: `${process.env.REACT_APP_BASE_URL}/api/licenses/`, // GET
    freeLicense: `${process.env.REACT_APP_BASE_URL}/api/support/licenses/{licenseId}/free/`, // GET
    moveNfts: `${process.env.REACT_APP_BASE_URL}/api/support/account/{account}/movenfts`, // POST
    changeAccount: `${process.env.REACT_APP_BASE_URL}/api/support/account/mnemoniclost/`, // POST
    nftMove: `${process.env.REACT_APP_BASE_URL}/api/support/nft/{nftId}/move`, // POST
    changeMail: `${process.env.REACT_APP_BASE_URL}/api/support/licenses/{licenseId}/changeMail`, // POST
    changeMailOrder: `${process.env.REACT_APP_BASE_URL}/api/support/order/{orderId}/changeMail`, // POST
    downloadZipInvoice: `${process.env.REACT_APP_BASE_URL}/api/orders/invoices`, // GET
    clawback: `${process.env.REACT_APP_BASE_URL}/api/support/nft/{nftId}/clawback`, // POST
    changeMailSensor: `${process.env.REACT_APP_BASE_URL}/api/support/devices/{deviceId}/changemail`, // POST
    getTransactions: `${process.env.REACT_APP_BASE_URL}/api/transactions`, // GET
    updateTransaction: `${process.env.REACT_APP_BASE_URL}/api/transactions`, // PUT
    trackTransaction: `${process.env.REACT_APP_BASE_URL}/api/transactions/import`, // POST
    exportTransaction: `${process.env.REACT_APP_BASE_URL}/api/transactions/export/xlsx`, // POST
    getSyncOrders: `${process.env.REACT_APP_BASE_URL}/api/transactions/orders-sync`, // GET
    saveSyncOrders: `${process.env.REACT_APP_BASE_URL}/api/transactions/orders-sync`, // PUT
    banDevice: `${process.env.REACT_APP_BASE_URL}/api/support/devices/{deviceId}/ban`, // POST
    banMail: `${process.env.REACT_APP_BASE_URL}/api/support/contacts/{mail}/ban`, // POST
    addContact: `${process.env.REACT_APP_BASE_URL}/api/contacts`,
    getLicensesHistory: `${process.env.REACT_APP_BASE_URL}/api/licenses/history`,
    getSensorsLicensesReport: `${process.env.REACT_APP_BASE_URL}/api/stats/sensors-licenses-overview/xlsx`,
    totalTransactions: `${process.env.REACT_APP_BASE_URL}/api/transactions/overview`, // GET
    mergeContact: `${process.env.REACT_APP_BASE_URL}/api/support/contacts/{contactMail}/merge`, // POST
    checkData: `${process.env.REACT_APP_BASE_URL}/api/support/devices/{deviceId}/checkdata` // GET
  },
  add_sensors: {
    infrastructure_percentage: 20
  },
  transaction: {
    address: 'CG7CUMAJWSTIP4KPQHWIII7QEASDQTGSOYRPRJ4WX7QZ7OQDCNZPJSNLHE'
  }
};

export default constants;