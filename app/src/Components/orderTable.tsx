/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { PersonX, Pencil } from 'react-bootstrap-icons';

interface IBillingProps {
  orderData: any
}

interface IBillingState {
  loading: boolean,
  tabledata: any
}

enum TableType {
  Billing,
  ShippingInfo,
  Items,
  Rewards
}

class OrderTable extends React.Component<IBillingProps, IBillingState> {

  constructor(props: any) {
    super(props);

    this.state = {
      loading: false,
      tabledata: props.orderData
    };

    this.renderRowsShippingInfo = this.renderRowsShippingInfo.bind(this);
    this.renderRowsItems = this.renderRowsItems.bind(this);
    this.renderRowsRewards = this.renderRowsRewards.bind(this);
    this.renderContactInfo = this.renderContactInfo.bind(this);
    this.getPriceFormat = this.getPriceFormat.bind(this);
  }

  mappedData(data: Array<any>, table: TableType) {
    let renderFunc: any;
    if (table === TableType.ShippingInfo) {
      renderFunc = this.renderRowsShippingInfo;
    } else if (table === TableType.Items) {
      renderFunc = this.renderRowsItems;
    } else if (table === TableType.Rewards) {
      renderFunc = this.renderRowsRewards;
    }
    // console.log(data);
    return data.map((r: any, i: any) => renderFunc(r, i));
  }

  mappedContacts(contacts: Array<any>) {
    return contacts.map((contact: any) => this.renderContactInfo(contact));
  }

  // eslint-disable-next-line class-methods-use-this
  renderContactInfo(contact: any) {
    return (
      <div>
        Email address:<br></br>{ contact.email } <br></br> Phone:<br></br>{ contact.phone }
      </div>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderRowsItems(row: any, index: any) {
    return (
      <tr key={ index } className='align-top'>
        <td></td>
        <td className="bottomLine">{ row.sensorType }</td>
        <td className="bottomLine">x{ row.sensorsQuantity }</td>
        <td className="bottomLine">{this.getPriceFormat(row.sensorsPrice)}</td>
        <td className="bottomLine">{this.getPriceFormat(row.sensorsQuantity * row.sensorsPrice)}</td>
        <td className="bottomLine">{this.getPriceFormat(row.sensorsVat)}</td>
      </tr>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderRowsShippingInfo(row: any, index: any) {
    return (
      <tr key={ index } className='align-top'>
        <td className='bottomLine'>{ row.shippingName }</td>
        <td className='bottomLine'>{ row.shippingAddress }</td>
        <td className='bottomLine'>
          {this.mappedContacts(row.shippingContacts)}
        </td>
        <td className='bottomLine font-weight-bold'>!ITEM</td>
        <td className='bottomLine font-weight-bold'>x!QTY</td>
        <td className='align-middle btn-cell'>
          <button className="iconButton my-2">
            <Pencil/>
          </button>
          <button className="iconButton my-2">
            <PersonX/>
          </button>
        </td>
        <td className='btn-cell'></td>
      </tr>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderRowsRewards(row: any, index: any) {
    return (
      <tr key={ index } className='align-top'>
        <td className='bottomLine'>{ row.reward }</td>
        <td className='bottomLine'>x{ row.quantity }</td>
        <td className='bottomLine'>{ row.date }</td>
        <td className='bottomLine'>{ row.account }</td>
        <td className='align-middle btn-cell'>
          <button className="iconButton my-2">
            <Pencil/>
          </button>
          <button className="iconButton my-2">
            <PersonX/>
          </button>
        </td>
        <td></td>
      </tr>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getPriceFormat(price: number) {
    return `€ ${(Math.round(price * 100) / 100).toFixed(2)}`;
  }

  render() {
    return (
      <div className='fullTablesContainer' >
        <div className='tablesContainer mt-1 mb-2 mx-auto justify-content-center d-flex flex-column'>

          {/* BILLING and ITEMS */}
          <div className='fullTable shadow rounded'>
            <table className='orderTable'>
              <thead className='tableTop'>
                <tr>
                    <th scope='col' className="billing">Billing</th>
                    <th scope='col'>Item</th>
                    <th scope='col'>Quantity</th>
                    <th scope='col'>Cost</th>
                    <th scope='col'>Price</th>
                    <th scope='col'>IVA</th>
                </tr>
              </thead>
              <tbody>
                <div className="d-inline position-absolute billing-td">
                  {this.state.tabledata.name}<br>
                  </br>{this.state.tabledata.billing.address}<br>
                  </br>{this.state.tabledata.billing.city}<br>
                  </br>{this.state.tabledata.billing.province} {this.state.tabledata.billing.postcode}<br>
                  </br>{this.state.tabledata.billing.country}
                  {/* country code should match a complete name */}
                  <br></br>
                  <br></br><span className='font-weight-bold'>Note</span>
                  <br></br>{this.state.tabledata.note}
                </div>
                { this.mappedData(this.state.tabledata.items, TableType.Items) }
                <tr>
                  <td></td>
                  <td></td>
                  <td>
                    Items to be Shipped:<br></br>
                    Shipped Items:<br></br>
                    Total Items:
                  </td>
                  <td>[]<br></br>[]<br></br>[]</td>
                  <td>Order Subtotal:<br></br>Vat:<br></br>Order Total:</td>
                  <td className='font-weight-bold'>
                    {this.getPriceFormat(this.state.tabledata.totalPrice.itemSubtotal)}<br></br>
                    {this.getPriceFormat(this.state.tabledata.totalPrice.totalVat)}<br></br>
                    {this.getPriceFormat(this.state.tabledata.totalPrice.orderTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SHIPPING INFO */}
          <div className='fullTable shadow rounded'>
            <table className='orderTable fixed-table'>
              <thead className='tableTop'>
                <tr>
                  <th scope='col'>Shipping Name</th>
                  <th scope='col'>Shipping Address</th>
                  <th scope='col'>Shipping Contacts</th>
                  <th scope='col'>Item</th>
                  <th scope='col'>QTY</th>
                  <th scope='col' className='btn-cell'></th>
                  <th scope='col' className='btn-cell-add'>
                    <div className='addButtonWrapper'>
                      <button className='addButton'>Add</button>
                    </div>
                  </th>
                </tr>
              </thead>
                <tbody>
                  <div className="d-inline position-absolute scrollbar-td">
                    {/* SCROLL BAR SPACE */}
                  </div>
                  { this.mappedData(this.state.tabledata.shippingInfo, TableType.ShippingInfo) }
                </tbody>
            </table>
          </div>

          {/* REWARDS */}
          <div className='fullTable shadow rounded'>
            <table className='orderTable fixed-table'>
                <thead className='tableTop'>
                    <tr>
                        <th scope='col'>Rewards</th>
                        <th scope='col'>Quantity</th>
                        <th scope='col'>Date</th>
                        <th scope='col'>Account</th>
                        <th scope='col' className='btn-cell'></th>
                        <th scope='col' className='btn-cell-add'>
                          <div className='addButtonWrapper'>
                            <button className='addButton'>Add</button>
                          </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                  { this.mappedData(this.state.tabledata.rewards, TableType.Rewards) }
                </tbody>
            </table>
          </div>
        </div>
        <div className="spaceBottomTables"></div>
      </div>
    );
  }

}

export default OrderTable;