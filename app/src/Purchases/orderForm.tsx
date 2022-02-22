import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Pencil, Check, Trash } from 'react-bootstrap-icons';
import Axios from 'axios';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { withRouter } from 'react-router';
import DatePicker from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import Order from '../Model/models/orderModel';
import './orderForm.scss';
import constants from '../constants';
import ModalContactAddress from '../Components/ModalContactAddress/ModalContactAddress';
import OrderProduct from '../Model/models/orderProductModel';

/* eslint-disable i18next/no-literal-string */

interface OrderFormProps extends WithTranslation {
  match: any,
  order?: Order
}

interface IOrderFormState {
  order_id?: number,
  order: Order & { orderProducts: (OrderProduct & { avoid_license?: boolean })[] },
  subtotal: number;
  vat: number;
  toShipItems: number,
  shippeditems: number,
  editBilling: boolean,
  editNote: boolean,
  editItems: boolean,
  editShippings: { [key: string]: boolean | { isFirst: true } },
  productTypes: any[],
  paymentTypes: any[]
}

class OrderForm extends React.Component<OrderFormProps, IOrderFormState> {

  billing: {
    showModal?: boolean,
    contact?: any,
    location?: any
  } = {};

  shippings: {
    showModal?: boolean,
    contact?: any,
    location?: any,
    items: any[]
  }[] = [];

  constructor(props: any) {
    super(props);
    this.state = {
      order_id: parseInt(props.match.params.id),
      order: props.order || new Order(),
      subtotal: 0,
      vat: 0,
      toShipItems: 0,
      shippeditems: 0,
      editBilling: false,
      editNote: false,
      editItems: false,
      editShippings: {},
      productTypes: [],
      paymentTypes: []
    };
  }

  componentDidMount = () => {
    if (this.state.order_id !== 0) {
      Axios.get(`${constants.api.getOrder}/${this.state.order_id}`).then((res) => {
        if (res.data && res.data.data) {
          const order = res.data.data;
          this.billing.contact = order.Billing.Contact;
          this.billing.location = order.Billing;
          this.shippings = order.shippings || [];
          this.setState({ order }, () => {
            this.updateOverview();
          });
        }
      });
    }

    Axios.get(`${constants.api.getProductTypes}`).then((res) => {
      if (res.data && res.data.data) {
        console.log(res.data.data);
        this.setState({ productTypes: res.data.data });
      }
    });

    Axios.get(`${constants.api.getPaymentTypes}`).then((res) => {
      if (res.data && res.data.data) {
        console.log(res.data.data);
        this.setState({ paymentTypes: res.data.data });
      }
    });
  };

  componentDidUpdate = (prevProps: any) => {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      if (this.props.match.params.id !== '0') {
        Axios.get(`${constants.api.getOrder}/${this.props.match.params.id}`).then((res) => {
          if (res.data && res.data.data) {
            const order = res.data.data;
            this.billing.contact = order.Billing.Contact;
            this.billing.location = order.Billing;
            this.shippings = order.shippings || [];
            this.setState({ order }, () => {
              this.updateOverview();
            });
          }
        });
      } else {
        this.billing = {};
        this.shippings = [];
        this.setState({ order: new Order(), order_id: 0 }, () => {
          this.updateOverview();
        });
      }
    }
  };

  /* HEADER RENDER */
  getHeader = () => {
    const { order, paymentTypes } = this.state;

    return <>
      <div>
        <button className="addButton float-left" style={{
          marginTop: '0.5em',
          marginBottom: '1em'
        }} onClick={() => window.history.back()}>
          {this.props.t('BACK')}
        </button>
      </div>
      <div className='topHead mx-auto d-flex flex-column justify-content-center' >
        <div className='headerContainer m-auto'>
          <div className='justify-left h-50 font-weight-bold align-self-center my-1 d-flex'>
            <div className='d-flex flex-row justify-content-between align-items-center h-50 align-self-center my-1' >
              <div className='mr-4'>
                {this.props.t('ORDER_DETAILS')}:<br />
                <input type="text" className="form-control"
                  defaultValue={order.order_id}
                  onKeyUp={(e: any) => {
                    order.order_id = e.target.value;
                  }}
                />
              </div>
              <div className='mr-4'>
                {this.props.t('ORDER_CODE')}:<br />
                <input type="text" className="form-control"
                  defaultValue={order.order_code}
                  onKeyUp={(e: any) => {
                    order.order_code = e.target.value;
                  }}
                />
              </div>
              <div className='mr-4'>
                {this.props.t('BILLING_CODE')}:<br />
                <input type="text" className="form-control"
                  defaultValue={order.billing_code}
                  onKeyUp={(e: any) => {
                    order.billing_code = e.target.value;
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div className='d-flex flex-row justify-content-between align-items-center h-50 align-self-center my-1' >
              <div className='mr-4'>
                {this.props.t('PAYMENT_METHOD')}:<br />
                <span className='font-weight-bold align-self-center'>
                  <select className="form-control" onChange={(e) => { order.payment_type = parseInt(e.target.value); }}>
                    <option>-</option>
                    {paymentTypes.map((pt) => <option key={pt.id} value={pt.id} selected={order.payment_type === pt.id}>
                      {pt.type} - {pt.currency}
                    </option>)}
                  </select>
                </span>
              </div>
              <div className='mx-4 datetime-input' >
                {this.props.t('ORDER_DATE')}:<br />
                {/* <input
                                type="date-time"
                                defaultValue={order.date ? new Date(order.date).toISOString().split('T')[0] : undefined}
                                onChange={(e) => {
                                    order.date = new Date(e.target.value);
                                }}
                            /> */}
                <DatePicker
                  inputProps={{ readOnly: true }}
                  value={new Date(order.date as Date)}
                  timeConstraints={{ hours: { step: 1, min: 0, max: 23 } }}
                  dateFormat={this.props.t('DATE_FORMAT').toString()}
                  timeFormat={'HH:mm'}
                  onChange={(date) => {
                    try {
                      order.date = (date as moment.Moment).toDate();
                      this.setState({});
                    } catch (error) {
                      console.log(error);
                    }
                  }} />
              </div>
              <div className='mx-4' >
                {this.props.t('SOURCE')}:<br />
                <span className='font-weight-bold'>
                  <input
                    type="text"
                    className="form-control"
                    defaultValue={order.source} onKeyUp={(e: any) => { order.source = e.target.value; }}
                  />
                </span>
              </div>
              <div className='ml-4' >
                {this.props.t('ORDER_TOTAL')}:<br />
                <span className='font-weight-bold'> {this.getPriceFormat(this.getTotal())}</span>
              </div>
            </div>
          </div >
        </div>
      </div >
    </>;
  };

  /* BODY RENDER */
  getBody = () => <div className='fullTablesContainer'>
    <div className='tablesContainer mt-1 mb-2 mx-auto justify-content-center d-flex flex-column'>
      {/* BILLING AND ITEMS TABLE */}
      {this.getBillingAndItemsTable()}
      {/* SHIPPINGS TABLE */}
      {this.getShippingsTable()}
      <div style={{ marginTop: '2em' }}>
        <button className="addButton float-right" onClick={() => this.save()}>
          {this.props.t('SAVE')}
        </button>
      </div>
    </div>
    <div className="spaceBottomTables"></div>

  </div>;

  /* BILLING AND ITEMS RENDER */
  getBillingFragment = () => <>
    {
      (this.billing.contact?.name || this.billing.contact?.surname) &&
      <>{this.billing.contact?.name} {this.billing.contact?.surname}<br /></>
    }
    {this.billing.location?.address && <>{this.billing.location?.address}<br /></>}
    {this.billing.location?.city && <>{this.billing.location?.city}<br /></>}
    {
      (this.billing.location?.province || this.billing.location?.postcode) &&
      <>{this.billing.location?.province} {this.billing.location?.postcode}<br /></>
    }
    {this.billing.location?.country && <>{this.billing.location?.country}<br /><br /></>}
    {/* country code should match a complete name */}
    <button className="iconButton my-2" onClick={() => {
      this.billing.showModal = true;
      this.setState({});
    }}>
      <Pencil />
    </button>
  </>;

  onBillingSave = (data: any) => {
    console.log(data);
    this.billing.contact = data.contact;
    this.billing.location = data.location;
    this.billing.showModal = false;
    this.setState({});
  };

  getOrderItems = () => {
    const { order, productTypes } = this.state;
    return <>
      {
        (!order.orderProducts || order.orderProducts.length === 0) && !this.state.editItems &&
        <tr>
          <td></td>
          <td colSpan={6} className="text-center">{this.props.t('NO_RESULTS')}</td>
        </tr>
      }
      {
        this.state.editItems &&
        productTypes.map((product, index) => {
          const line: OrderProduct & { avoid_license?: boolean } | undefined = this.state.order.orderProducts
            .find((op) => op.id === product.id);
          return <tr key={index} className='align-top editItem'>
            <td>
              <input type="hidden" name="product.id" defaultValue={product.id} />
            </td>
            <td className="bottomLine">{product.friendly_name}</td>
            <td className="bottomLine">
              <input type="number" name={'product.quantity'} min="0" defaultValue={line?.quantity || 0} />
            </td>
            <td className="bottomLine">
              <input type="number" name={'product.price'} min="0" defaultValue={line?.price || 0} />
            </td>
            <td className="bottomLine">{this.getPriceFormat((product.price * product.quantity) || 0)}</td>
            <td className="bottomLine">
              <input type="number" name={'product.vat'} min="0" defaultValue={line?.vat || 0} />
            </td>
            {/* <td className="bottomLine">
              <input name={'product.avoid_license'} type="checkbox" defaultChecked={line?.avoid_license} />
            </td> */}
          </tr>;
        })
      }
      {
        !this.state.editItems &&
        order.orderProducts.map((product: any, index) =>  <>
          {
            <tr key={index} className='align-top'>
              <td></td>
              <td className="bottomLine">{product.friendly_name}</td>
              <td className="bottomLine">x{product.quantity}</td>
              <td className="bottomLine">{this.getPriceFormat(product.price)}</td>
              <td className="bottomLine">{this.getPriceFormat(product.price * product.quantity)}</td>
              <td className="bottomLine">{this.getPriceFormat(product.vat)}</td>
              {/* <td className="bottomLine">
                <input name={'product.avoid_license'} type="checkbox" disabled={true} defaultChecked={product?.avoid_license} />  
              </td> */}
            </tr>
          }
        </>
        )}
    </>;
  };

  updateItems = () => {
    const items = Array.from(document.querySelectorAll('.editItem'))
      .filter((tr: Element) => {
        const qta = parseInt(tr.querySelector<HTMLInputElement>('input[name="product.quantity"]')?.value as string);
        return qta > 0;
      }).map((tr) => {
        let op = this.state.productTypes
          .find((pt) => pt.id === parseInt(tr.querySelector<HTMLInputElement>('input[name="product.id"]')?.value as string));
        op = JSON.parse(JSON.stringify(op));
        op.quantity = parseInt(tr.querySelector<HTMLInputElement>('input[name="product.quantity"]')?.value as string);
        op.price = parseFloat(tr.querySelector<HTMLInputElement>('input[name="product.price"]')?.value as string);
        op.vat = parseFloat(tr.querySelector<HTMLInputElement>('input[name="product.vat"]')?.value as string);
        // op.avoid_license = tr.querySelector<HTMLInputElement>('input[name="product.avoid_license"]')?.checked;
        return op;
      });
      // TODO: PER FAR FUNZIONARE IL SALVATAGGIO HO DOVUTO ELEMINARE DA ORDER PRODUCTS I FIELD CATEGORY E AVOID_LICENSE. RISOLVERE
      let itemsOrder;
      items.forEach((item) => {
        delete item.category;
        // delete item.avoid_license;
        itemsOrder = items;
        // console.log(itemsOrder);
        this.state.order.orderProducts = items;
      });
      console.log(itemsOrder);
    // this.state.order.orderProducts = items;
    this.updateOverview();
    this.setState({ editItems: false });
  };

  getBillingAndItemsTable() {
    return <div className='fullTable shadow rounded'>
      <table className='orderTable'>
        <thead className='tableTop'>
          <tr>
            <th scope='col' className="billing">{this.props.t('BILLING')}</th>
            <th scope='col'>{this.props.t('ITEM')}</th>
            <th scope='col'>{this.props.t('QUANTITY')}</th>
            <th scope='col'>{this.props.t('COST')}</th>
            <th scope='col'>{this.props.t('PRICE')}</th>
            <th scope='col'>{this.props.t('VAT')}</th>
            {/* <th scope='col'>{this.props.t('AVOID_LICENSE')}</th> */}
            <th scope='col' className='btn-cell-add'>
              <div className='addButtonWrapper'>
                <button className='addButton'
                  onClick={() => {
                    if (this.state.editItems) {
                      this.updateItems();
                      return;
                    }
                    this.setState({ editItems: true });
                  }}
                >
                  {this.state.editItems ? this.props.t('SAVE') : this.props.t('EDIT')}
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <div className="d-inline position-absolute billing-td">
            {this.getBillingFragment()}
          </div>
          {this.getOrderItems()}
          <tr>
            <td></td>
            <td></td>
            <td>
              {this.props.t('ITEMS_TO_SHIP')}:  <br />
              {this.props.t('ITEMS_SHIPPED')}: <br />
              {this.props.t('TOTAL_ITEMS')}:
            </td>
            <td>
              {this.state.toShipItems}<br />
              {this.state.shippeditems}<br />
              {this.state.shippeditems + this.state.toShipItems}
            </td>
            <td>
              {this.props.t('ORDER_SUBTOTAL')}:<br />
              {this.props.t('VAT')}:<br />
              {this.props.t('ORDER_TOTAL')}:
            </td>
            <td className='font-weight-bold'>
              {this.getPriceFormat(this.state.subtotal)}<br></br>
              {this.getPriceFormat(this.state.vat)}<br></br>
              {this.getPriceFormat(this.state.subtotal + this.state.vat)}
            </td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td colSpan={4} style={{ whiteSpace: 'pre-line' }}>
              <b>Note:</b> {
                !this.state.editNote
                  ? <>{this.state.order?.note}</>
                  : <textarea style={{ width: '100%' }} defaultValue={this.state.order?.note}
                    onChange={(ev: any) => {
                      this.state.order.note = ev.target.value;
                      this.setState({});
                    }}
                  ></textarea>
              }
              <button className="iconButton my-2" onClick={() => {
                this.setState({ editNote: !this.state.editNote });
              }}>
                {!this.state.editNote ? <Pencil /> : <Check />}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>;
  }

  /* SHIPPINGS RENDER */
  getShippingsTable() {
    return <div className='fullTable shadow rounded'>
      <table className='orderTable fixed-table' style={{ minHeight: 'auto' }}>
        <thead className='tableTop'>
          <tr>
            <th scope='col'>{this.props.t('SHIPPING_NAME')}</th>
            <th scope='col'>{this.props.t('SHIPPING_ADDRESS')}</th>
            {/* <th scope='col'>{this.props.t('SHIPPING_CONTACTS')}</th> */}
            <th scope='col'>{this.props.t('ITEM')}</th>
            <th scope='col'>{this.props.t('QUANTITY')}</th>
            <th scope='col' className='btn-cell-add'>
              <div className='addButtonWrapper'>
                <button className='addButton' onClick={() => this.addShipping()}>{this.props.t('ADD')}</button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <div className="d-inline position-absolute scrollbar-td">
            {/* SCROLL BAR SPACE */}
          </div>
          {
            (this.shippings || []).map((shipping, index) => <>
              <tr key={`shipping-${index}`}>
                <td>
                  {shipping.contact?.name} {shipping.contact?.surname}<br />
                  {shipping.contact?.mail}<br />
                  {shipping.contact?.phone}<br />
                </td>
                <td>
                  {shipping.location?.address && <>{shipping.location?.address}<br /></>}
                  {shipping.location?.city && <>{shipping.location?.city}<br /></>}
                  {
                    (shipping.location?.province || shipping.location?.postcode) &&
                    <>{shipping.location?.province} {shipping.location?.postcode}<br /></>
                  }
                  {shipping.location?.country && <>{shipping.location?.country}<br /><br /></>}
                </td>
                <td className='bottomLine font-weight-bold'>
                  {(shipping.items || []).map((item: any, i: number) => <div
                    key={`shipping-item-${index}-${i}type`}
                  >
                    {item.friendlyName}
                  </div>)}
                </td>
                <td className='bottomLine font-weight-bold'>
                  {(shipping.items || []).map((item: any, i: number) => <div
                    key={`shipping-item-${index}-${i}qta`}
                  >
                    x{item.quantity}
                  </div>)}
                </td>
                <td className="d-flex">
                  <button className="closeButton my-2" style={{ marginRight: '0.25em' }} onClick={() => {
                    this.shippings.splice(index, 1);
                    this.updateOverview();
                    this.setState({});
                  }}>
                    <Trash />
                  </button>
                  <button className="iconButton my-2" onClick={() => {
                    shipping.showModal = true;
                    this.setState({});
                  }}>
                    <Pencil />
                  </button>
                </td>
              </tr>
              {this.openShippingModalEdit(shipping, index)}
            </>)
          }
          {
            this.shippings?.length === 0 &&
            <tr>
              <td className="text-center" colSpan={5}>{this.props.t('NO_RESULTS')}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>;
  }

  addShipping() {
    this.shippings.push({ items: [], showModal: true });
    this.setState({});
    // this.state.editShippings['shipping-' + (this.state.order.shippings.length - 1)] = { isFirst: true };
    // this.setState({ order: this.state.order, editShippings: this.state.editShippings });
  }

  onShippingSave = (shipping: any, data: any) => {
    shipping.contact = data.contact;
    shipping.location = data.location;
    shipping.showModal = false;
    this.updateOverview();
    this.setState({});
  };

  openShippingModalEdit(shipping: any, index: number) {
    return <Modal show={shipping.showModal} onHide={() => {
      shipping.showModal = false;
      this.setState({});
    }}>
      <Modal.Header closeButton>
        <Modal.Title>{this.props.t('SHIPPING_DATA')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <Form.Label>{this.props.t('ITEMS_FOR_SHIPPING')}</Form.Label>
            <table className="items">
              <tbody>
                {this.getResidualItems(shipping).map((item) => {
                  const item1 = (shipping.items || []).find((r: any) => r.id === item.id);
                  return <tr key={item.id}>
                    <td>{item.friendly_name}</td>
                    <td>
                      <input className={`shipping-items-${index}`} type="number"
                        data-sensorid={item.id}
                        data-friendlyname={item.friendly_name}
                        name={`shipping-${item.id}-qta`}
                        defaultValue={item1?.quantity || 0}
                        max={item.residual}
                        min="0"
                      />
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </Col>
          <Col>
            <ModalContactAddress show={true} onSave={(data: any) => {
              const items = Array.from(document.querySelectorAll<HTMLInputElement>(`.shipping-items-${index}`));
              shipping.items = items.map((i) => ({
                id: parseInt(i.dataset.sensorid as string),
                friendlyName: i.dataset.friendlyname,
                quantity: parseInt(i.value)
              })).filter((i) => i.quantity);
              this.onShippingSave(shipping, data);
            }} />
          </Col>
        </Row>
      </Modal.Body>
    </Modal>;
  }

  getResidualItems(shipping: any) {
    const items: any = {};
    this.state.order.orderProducts.map((op) => {
      items[`item-${op.id}`] = op.quantity;
      return 0;
    });

    this.shippings.map((s) => {
      s.items.map((i) => {
        items[`item-${i.id}`] -= i.quantity;
        return 0;
      });
      return 0;
    });

    shipping.items.map((i: any) => {
      items[`item-${i.id}`] += i.quantity;
      return 0;
    });

    const products: any[] = [];
    Object.keys(items).filter((i) => items[i] > 0).map((i) => {
      const temp = this.state.order.orderProducts.find((op) => op.id === parseInt(i.replace('item-', '')));
      const item = JSON.parse(JSON.stringify(temp));
      item.residual = items[i];
      products.push(item);
      return 0;
    });
    return products;
  }

  /* COMMON FUNCTIONS */
  getPriceFormat = (price: number) => {
    const symbol = this.state.order?.source?.endsWith('.us/') ? '$' : '€';
    return `${symbol} ${(Math.round(price * 100) / 100).toFixed(2)}`;
  };

  getTotal = () => this.state.subtotal + this.state.vat;

  updateOverview = () => {
    const { order } = this.state;
    const totalItems = order.orderProducts.map((op) => op.quantity).reduce((a, b) => a + b, 0);
    const shipped = (order.shippings || [])
      .map((s: any) => (s.items || []).map((i: any) => i.quantity).reduce((a: number, b: number) => a + b, 0))
      .reduce((a: number, b: number) => a + b, 0);
    const subtotal = order.orderProducts.map((op) => op.price * op.quantity).reduce((a, b) => a + b, 0);
    const vat = order.orderProducts.map((op) => op.vat).reduce((a, b) => a + b, 0);

    this.setState({
      toShipItems: totalItems - shipped,
      shippeditems: shipped,
      subtotal,
      vat
    });
  };

  getContactByEmail = async (mail: string) => {
    const result = await Axios.get(`${constants.api.getContact}/${mail}`);
    return result.data?.data[0];
  };

  getLocationsByEmail = async (mail: string) => {
    const result = await Axios.get(`${constants.api.getLocationsByContact}${encodeURIComponent(mail as string)}`);
    return result.data?.data;
  };

  save = async () => {
    const order: Order = JSON.parse(JSON.stringify(this.state.order));

    if (this.billing.location.id) {
      order.billing = this.billing.location.id;
      order.Billing = undefined;
    } else {
      order.Billing = this.billing.location;
      if (order.Billing) {
        order.Billing.Contact = this.billing.contact;
      }
    }

    order.shippings = this.shippings as any;
    order.total = this.state.subtotal + this.state.vat;
    order.vat = this.state.vat;

    let result: any = { success: false };

   
    try {
      if (order.id) {
        result = (await Axios.put(`${constants.api.updateOrderFull}`, order)).data;
      } else {
        result = (await Axios.post(`${constants.api.addOrderFull}`, order)).data;
      }
    } catch (error) {
      console.log(error);
    }

    if (result.success) {
      alert(this.props.t('ORDER_SAVED'));
      (this.props as any).history.push({ pathname: '/purchases' });
      return;
    }

    alert(this.props.t('ORDER_NOT_SAVED'));
  };

  render() {
    return <>
      { /* HEADER */ this.getHeader()}
      { /* BODY */ this.getBody()}
      <Modal show={this.billing.showModal} onHide={() => {
        this.billing.showModal = false;
        this.setState({});
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.t('BILLING_DATA')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalContactAddress show={true} onSave={this.onBillingSave} />
        </Modal.Body>
      </Modal>
    </>;
  }

}

export default withTranslation()(withRouter(OrderForm as any));
