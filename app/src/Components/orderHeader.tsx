/* eslint-disable i18next/no-literal-string */
import React from 'react';

class OrderHeader extends React.Component<any, any> {

  paymentMethodLabel = 'Payment Method:';
  dateOrderLabel = 'Date Order:';
  orderPriceLabel = 'Order Price:';
  ecommerceLabel = 'Ecommerce:';

  constructor(props: any) {
    super(props);

    this.state = {
      orderData: props.orderData
    };
  }

  render() {
    const orderTitle = `Order #${this.state.orderData.orderNumber} Details`;
    const orderFinalPrice = `€ ${(Math.round(this.state.orderData.totalPrice.orderTotal * 100) / 100).toFixed(2)}`;

    return (
        <div className='topHead mx-auto d-flex flex-column justify-content-center' >
            <div className='headerContainer m-auto'>
                <div className='justify-left h-50 font-weight-bold align-self-center my-1' >
                    {orderTitle}
                </div>
                <div>
                    <div className='d-flex flex-row justify-content-between align-items-center h-50 align-self-center my-1' >
                        <div className='mr-4'>
                            {this.paymentMethodLabel}<br></br>
                            <span className='font-weight-bold align-self-center'> {this.state.orderData.paymentMethod}</span>
                        </div>
                        <div className='mx-4' >
                            {this.dateOrderLabel}<br></br>
                            <span className='font-weight-bold'>{this.state.orderData.dateOrder}</span>
                        </div>
                        <div className='mx-4' >
                            {this.orderPriceLabel}<br></br>
                            <span className='font-weight-bold'>{orderFinalPrice}</span>
                        </div>
                        <div className='ml-4' >
                            {this.ecommerceLabel}<br></br>
                            <span className='font-weight-bold'>{this.state.orderData.ecommerce}</span>
                        </div>
                    </div>
                </div >
            </div>
        </div>
    );
  }

}

export default OrderHeader;