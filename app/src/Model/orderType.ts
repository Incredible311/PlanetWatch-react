import IAddress from './addressType';
import PaymentType from './paymentType';

export default interface IOrder {
  [key: string]: string | number | undefined | PaymentType | IAddress,
  orderId?: string,
  email?: string,
  date?: number,
  billingAddress?: IAddress,
  note?: string,
}