import { Icon } from 'react-bootstrap-icons';
import RouteModel from './routeModel';

interface NavItem extends RouteModel {
  text: string;
  icon: Icon;
  children?: NavItem[];
  className?: string;
  onClick?: () => void;
}

export default NavItem;