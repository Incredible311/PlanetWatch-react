import ClientRole from './clientRole';

interface RouteModel {
  path: string;
  forRealm: boolean;
  roles: ClientRole[];
  component?: React.ComponentType;
}

export default RouteModel;