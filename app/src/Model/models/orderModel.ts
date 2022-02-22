import Shipping from './shippingModel';
import OrderProduct from './orderProductModel';
import PaymentType from './paymentTypeModel';
import Location from './locationModel';

export default class Order {

  id?: number;
  source?: string;
  order_id?: string;
  order_code?: string;
  date?: Date;
  payment_type?: number;
  billing?: number;
  total: number = 0;
  vat: number = 0;
  note?: string;

  orderProducts: OrderProduct[] = [];
  shippings: Shipping[] = [];
  Billing?: Location;
  paymentType?: PaymentType;
  billing_code?: string;

  constructor() {
    this.Billing = new Location();
  }

  static fromJSON(jsonOrder: Order) {
    const order = new Order();
    Object.assign(order, jsonOrder);
    order.Billing = order.Billing || new Location();
    order.paymentType = order.paymentType || new PaymentType();
    order.shippings = order.shippings || [];
    order.orderProducts = order.orderProducts || [];

    return order;
  }

}
