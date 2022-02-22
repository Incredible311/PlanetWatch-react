import Contact from './contactModel';

export default class Location {

  id?: number;
  contact_id?: number;
  address: string = '';
  postcode: string = '';
  city: string = '';
  province: string = '';
  country: string = '';
  floor?: number;

  Contact?: Contact;

  constructor() {
    this.Contact = new Contact();
  }

}