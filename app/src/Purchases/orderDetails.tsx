/* eslint-disable i18next/no-literal-string */
import React from 'react';
import OrderHeader from '../Components/orderHeader';
import OrderTable from '../Components/orderTable';
import IAddress from '../Model/addressType';

interface IAddPurchaseState {
  data: IOrder
  loading: boolean,
  calendar: boolean,
  date?: Date | Date[] | null,
  shippingForm: JSX.Element[],
  sensorsForm: JSX.Element[],
  rewardsForm: JSX.Element[]
}

interface IOrder {
  [key: string]: string | number | undefined | IAddress | any[],
  orderId?: string,
  email?: string,
  date?: string,
  billingAddress?: IAddress,
  shippingAddress?: IAddress,
  note?: string,
  lineItems?: any[],
  name?: string,
  source?: string
}

class OrderDetails extends React.Component<any, any> {

  // Fake data for test:
  rowShippingInfo1 = {
    shippingName: 'Derek Dainys',
    shippingAddress: '12345 South Mallard Lane, Homer Glen',
    shippingContacts: [
      { email: 'derekdainys@gmail.com', phone: '1523888812' },
      { email: 'test@gmail.com', phone: '1522229999' }
    ]
  };

  rowShippingInfo2 = {
    shippingName: 'Derek Dainys',
    shippingAddress: '12345 South Mallard Lane, Homer Glen',
    shippingContacts: [
      { email: 'derekdainys@gmail.com', phone: '1523888812' },
      { email: 'test@gmail.com', phone: '1522229999' }
    ]
  };

  rowReward1 = {
    reward: 'Rewards 1',
    quantity: 100,
    date: '27/05/2021',
    account: 'ADFHWIDHQOFHSHDAKJHF'
  };

  rowReward2 = {
    reward: 'Rewards 2',
    quantity: 200,
    date: '27/05/2021',
    account: 'ADFHWIDHQOFHSHDAKJHFWQHIOWOIDWQFWQDUBQWKUCBWQBEDUWFQWDVWQUCVWQO'
  };

  constructor(props: any) {
    super(props);

    this.state = {
      data: props.data
    };
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    let itemSubtotal = 0;
    let totalVat = 0;
    let orderTotal = 0;
    this.state.data.lineItems.forEach((el: any) => {
      itemSubtotal += el.sensorsQuantity * el.sensorsPrice;
      totalVat += el.sensorsVat;
    });
    orderTotal += itemSubtotal + totalVat;

    const orderData = {
      name: this.state.data.name,
      orderNumber: this.state.data.orderId,
      paymentMethod: this.state.data.paymentType,
      dateOrder: this.state.data.date,
      ecommerce: 'PlanetWatch.io', // Hardcoded?
      totalPrice: {
        itemSubtotal,
        totalVat,
        orderTotal
      },
      billing: this.state.data.billingAddress,
      shippingInfo: [
        this.rowShippingInfo1,
        this.rowShippingInfo2
      ],
      items: this.state.data.lineItems,
      rewards: [
        this.rowReward1,
        this.rowReward2
      ]
    };

    return (
        <div className='fullPopup text-white mx-auto d-flex flex-column justify-content-center' >
            <OrderHeader orderData={orderData}/>
            <OrderTable orderData={orderData}/>
        </div>
    );
  }

}

export default OrderDetails;
export type {
  IOrder,
  IAddPurchaseState
};