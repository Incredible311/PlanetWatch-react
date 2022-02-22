import Location from './locationModel';

export default class Shipping {

  id?: number;
  order_id?: number;
  date?: Date;
  location_id?: number;
  sensor_type_id?: number;
  quantity: number = 0;

  Location: Location;

  constructor() {
    this.Location = new Location();
  }

}