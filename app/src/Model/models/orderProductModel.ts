export default class OrderProduct {

  id?: number;
  order?: number;
  product_type_id?: number;
  friendly_name?: string;
  quantity: number = 0;
  price: number = 0;
  vat: number = 0;

}