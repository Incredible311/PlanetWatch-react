import SensorsType from './sensorsType';
import Keycloak from './keycloak';
import Api from './api';

interface Constants {
  sensors_type: SensorsType;
  keycloak: Keycloak;
  api: Api;
  add_sensors: {
    infrastructure_percentage: number
  }
  transaction: {
    address: string
  }
}

export default Constants;