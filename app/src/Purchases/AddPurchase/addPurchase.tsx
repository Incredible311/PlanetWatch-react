import React, { ChangeEvent } from 'react';
import Axios, { AxiosResponse } from 'axios';
import { Container, Card, Form, Row, Col, Dropdown, ButtonGroup, Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { withTranslation } from 'react-i18next';
import PaymentType from '../../Model/paymentType';
import IAddress from '../../Model/addressType';
// import ShippingForm from '../../Components/ShippingForm';
import SensorsForm from '../../Components/SensorsForm';
import RewardForm from '../../Components/RewardForm';
import SensorInput from '../../Components/SensorInput';
import ContactAddressForm from '../../Components/ContactAddressForm';
import constants from '../../constants';

interface IOrder {
  [key: string]: string | number | undefined | IAddress | any[],
  orderId?: string,
  email?: string,
  date?: string,
  billingAddress?: IAddress,
  shippingAddresses?: { qta: number, sensorType?: string, address?: IAddress }[],
  note?: string,
  lineItems?: any[],
  name?: string,
  source?: string,
}

interface IAddPurchaseState {
  data: IOrder
  loading: boolean,
  calendar: boolean,
  date?: Date | Date[] | null,
  shippingForm: JSX.Element[],
  sensorsForm: JSX.Element[],
  rewardsForm: JSX.Element[]
}

function getSubtotal(lineItems: any[]) {
  if (!lineItems) {
    return 0;
  }

  let result: number = 0 as number;
  let value: any = 0 as number;
  lineItems.forEach((lineItem) => {
    const price = lineItem.sensorsPrice;
    const quantity = lineItem.sensorsQuantity;

    value = (price === null || price === undefined || price === '' || quantity === null || quantity === undefined || quantity === '') ? null
      : parseFloat(quantity.toString()) * parseFloat(price.toString());

    result = value !== null && value !== undefined ? result + parseFloat(value) : result;
  });
  return result.toFixed(2);

  /* let index = 0;
  while (value !== null && value !== undefined) {
    const priceProperty = `sensorsPrice${index}`;
    const quantityProperty = `sensorsQuantity${index}`;
    const price = data[priceProperty];
    const quantity = data[quantityProperty];
    value = (price === null || price === undefined || price === '' || quantity === null || quantity === undefined || quantity === '') ? null
      : parseFloat(quantity.toString()) * parseFloat(price.toString());
    index += 1;
    result = value !== null && value !== undefined ? result + parseFloat(value) : result;
  }
  return result.toFixed(2); */
}

function getTotalVat(lineItems: any[]) {
  if (!lineItems) {
    return 0;
  }

  let result: number = 0;
  let value: any = 0 as number;

  lineItems.forEach((lineItem) => {
    const vat = lineItem.sensorsVat;
    const price = lineItem.sensorsPrice;
    const quantity = lineItem.sensorsQuantity;

    value = (vat === null || vat === undefined || vat === '' || price === null || price === undefined ||
      price === '' || quantity === null || quantity === undefined || quantity === '') ? null
      : (((parseFloat(price.toString()) * (parseFloat(quantity.toString()))) / 100) *
        (parseFloat(vat.toString())));
    result = value !== null && value !== undefined ? result + parseFloat(value) : result;
  });

  return result.toFixed(2);

  /* let result: number = 0;
  let value: any = 0 as number;
  let index = 0;
  while (value !== null && value !== undefined) {
    const vatProperty = `sensorsVat${index}`;
    const priceProperty = `sensorsPrice${index}`;
    const quantityProperty = `sensorsQuantity${index}`;
    const vat = data[vatProperty];
    const price = data[priceProperty];
    const quantity = data[quantityProperty];
    value = (vat === null || vat === undefined || vat === '' || price === null || price === undefined ||
      price === '' || quantity === null || quantity === undefined || quantity === '') ? null
      : (((parseFloat(price.toString()) * (parseFloat(quantity.toString()))) / 100) *
        (parseFloat(vat.toString())));
    index += 1;
    result = value !== null && value !== undefined ? result + parseFloat(value) : result;
  }
  return result.toFixed(2); */
}

function getTotal(data: any[]) {
  const vat: any = getTotalVat(data);
  const price: any = getSubtotal(data);
  return (parseFloat(vat) + parseFloat(price)).toFixed(2);
}

class AddPurchase extends React.Component<any, IAddPurchaseState> {

  constructor(props: any) {
    super(props);
    console.log(props);

    let sensorsFormFromProps: JSX.Element[] = [];
    if (props && props.data && props.data.lineItems) {
      props.data.lineItems.forEach((orderProduct: any, index: number) => {
        sensorsFormFromProps[index] =
          <SensorsForm key={index}
            index={index}
            onChangeValue={this.onChangeValueSensor}
            onTypeSelected={(a: any) => this.onChangeSensorType(a, 0)}
            value={orderProduct} />;
      });
    } else {
      sensorsFormFromProps = [<SensorsForm key={0}
        index={0}
        onChangeValue={this.onChangeValueSensor}
        onTypeSelected={(a: any) => this.onChangeSensorType(a, 0)} />];
    }

    this.state = {
      loading: false,
      date: new Date(),
      calendar: false,
      data: props.data !== null && props.data !== undefined ? props.data : {},
      sensorsForm: sensorsFormFromProps,
      // shippingForm: [<ShippingForm key={0} index={0} onChangeValue={this.onChangeValue} />],
      shippingForm: [],
      rewardsForm: [<RewardForm key={0} index={0} onChangeValue={this.onChangeValue} />]
    };
  }

  savePurchase = async (event: any) => {
    console.log(event);
    console.log('Saving');

    const adding: IOrder = this.state.data;
    console.log(adding);
    const body: any = {};
    body.line_items = [];
    body.billing = adding.billingAddress;
    body.shipping = {};
    body.id = adding.orderId;
    if (adding.date) {
      const date1 = adding.date.split('/');
      const newDate = `${date1[1]}/${date1[0]}/${date1[2]}`;
      const date = new Date(newDate);
      body.date_created_gmt = date.toISOString().slice(0, 10);
    }
    body.customer_note = adding.note;
    body.billing.email = adding.mail;
    body.currency = 'EUR';
    body.payment_method = adding.paymentType;
    body.total_tax = getTotalVat(adding.lineItems as any[]);
    body.total = getTotal(adding.lineItems as any[]);
    body.number = Math.random().toString().replace('.', ''); // ToDo -> guarda backend (concatena woocommerce + body.number)

    if (adding && adding.lineItems) {
      adding.lineItems.forEach((lineItem: any, index: number) => {
        body.line_items[index] = {
          quantity: lineItem.sensorsQuantity,
          price: lineItem.sensorsPrice,
          total_tax: lineItem.sensorsVat,
          sku: lineItem.name,
          name: lineItem.name,
          product_id: lineItem.name
        };
      });
    }

    console.log(body);

    await Axios.post(constants.api.addOrder, body)
      .then((res: AxiosResponse) => {
        console.log(res);
        console.log('API called');
      })
      .catch((reason: any) => {
        console.log(reason);
      });
  };

  onChangeSensorType = (name: any, index: any) => {
    const newLineItems = this.state.data.lineItems ? this.state.data.lineItems : [];
    if (!newLineItems[index]) newLineItems[index] = { name };
    newLineItems[index].name = name;
    this.setState({ data: { ...this.state.data, lineItems: newLineItems } });
    console.log(this.state.data);
  };

  onChangeValueSensor = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const value = e.target.valueAsNumber;
    const index: number = parseInt(field.substr(field.length - 1));
    const lineItemField = field.slice(0, -1);
    const newLineItems = this.state.data.lineItems ? this.state.data.lineItems : [];
    if (!newLineItems[index]) newLineItems[index] = {};
    newLineItems[index][lineItemField] = value;
    this.setState({ data: { ...this.state.data, lineItems: newLineItems } });
    console.log(this.state.data);
  };

  onChangeBilling = (location: IAddress) => {
    if (!location) return;
    const { data } = this.state;
    this.setState({ data: { ...data, billingAddress: location } });
    console.log(this.state.data);
  };

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;
    const { data } = this.state;
    data[field] = value;
    this.setState({ data });
    console.log(this.state.data);
  };

  onChangeDate = (date: Date | Date[] | null | undefined) => {
    this.setState({ date, data: { ...this.state.data, date: date?.toLocaleString().split(',')[0] } });
    console.log(this.state.data);
  };

  paymentTypeChanged = (event: ChangeEvent<HTMLInputElement>): void => {
    const { data } = this.state;
    data.paymentType = event.target.value as unknown as PaymentType;
    this.setState({ data });
    console.log(data);
  };

  paymentTypeSelected = (eventKey: any): void => {
    const { data } = this.state;
    data.paymentType = eventKey;
    this.setState({ data });
    console.log(data);
  };

  formOrder = () => (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId='orderId'>
          <Form.Label>{this.props.t('NAME')}</Form.Label>
          <Form.Control placeholder={this.props.t('NAME')} required type='text' value={this.state.data?.name}
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='mail'>
          <Form.Label>{this.props.t('Source')}</Form.Label>
          <Form.Control placeholder={this.props.t('Source')} required type='text' value={this.state.data?.source}
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='orderId'>
          <Form.Label>{this.props.t('ORDER_ID')}</Form.Label>
          <Form.Control placeholder={this.props.t('ORDER_ID')} required type='text' value={this.state.data?.orderId}
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='mail'>
          <Form.Label>{this.props.t('MAIL')}</Form.Label>
          <Form.Control placeholder={this.props.t('MAIL')} required type='text' value={this.state.data?.email}
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='date'>
          <Form.Label>{this.props.t('DATE')}</Form.Label>
          <Form.Control placeholder={this.props.t('DATE')} required type='text' value={this.state.data?.date}
            onClick={() => this.setState({ calendar: true })} onBlur={() => setTimeout(() => this.setState({ calendar: false }), 1000)} />
          {this.state.calendar && <Calendar onChange={this.onChangeDate} value={this.state.date} />}
        </Form.Group>
        <ContactAddressForm
          value={this.state.data.billingAddress &&
            `${this.state.data.billingAddress.address}, ${this.state.data.billingAddress.city}, ${this.state.data.billingAddress.country}`
          }
          email={this.state.data.mail ? this.state.data.mail : ''}
          onChange={this.onChangeBilling}
          canAddAddress={true}
        />
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='note'>
          <Form.Label>{this.props.t('NOTE')}</Form.Label>
          <Form.Control placeholder={this.props.t('NOTE')} as="textarea" value={this.state.data?.note}
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
    </>
  );

  formSensors = () => (
    <>
      <Form.Row>
        <SensorInput />
        <Col sm={3}>
          <Form.Group controlId='quantity'>
            <Form.Label>{this.props.t('QUANTITY')}</Form.Label>
            <Form.Control placeholder={this.props.t('QUANTITY')} required type='text'
              onChange={this.onChangeValue} />
          </Form.Group>
        </Col>
        <Col sm={3}>
          <Form.Group controlId='price'>
            <Form.Label>{this.props.t('PRICE')}</Form.Label>
            <Form.Control placeholder={this.props.t('PRICE')} required type='text'
              onChange={this.onChangeValue} />
          </Form.Group>
        </Col>
      </Form.Row>
    </>
  );

  getShippingSensorsTypes = () => {
    console.log(this.state.data.lineItems);
    return (this.state.data.lineItems || []).map((li: any) => li.name);
  };

  formShippings = () => {
    const shippings = [];
    for (let i = 0; i < (this.state.data.shippingAddresses || []).length; i += 1) {
      const shipping = (this.state.data.shippingAddresses || [])[i];
      shippings.push(<Form.Row>
        <Col sm={1}>
          <Form.Label>{this.props.t('')}</Form.Label>
          <Button onClick={() => { this.deleteShipping(shipping); }}>
            <Trash></Trash>
          </Button>
        </Col>
        <ContactAddressForm
          value={shipping.address ? `${shipping.address.address}, ${shipping.address.city}, ${shipping.address.country}` : ''}
          email={this.state.data.mail ? this.state.data.mail : ''}
          canAddAddress={true}
          onChange={(e: any) => { console.log(e); }}
          addressSaved={(address: IAddress) => {
            shipping.address = address;
            this.setState({});
          }}
        />
        <SensorInput
          value={shipping.sensorType}
          filter={this.getShippingSensorsTypes()}
          typeSelected={(eventKey: string | null) => {
            shipping.sensorType = eventKey as string;
            this.setState({});
          }}
        />
        <Col sm={3}>
          <Form.Group controlId='quantity'>
            <Form.Label>
              {this.props.t('QUANTITY')}
            </Form.Label>
            <Form.Control placeholder={this.props.t('QUANTITY')} required type='number'
              max={
                this.getResidualQtaForSensorType(shipping.sensorType as string) === 0
                  ? this.getResidualQtaForSensorType(shipping.sensorType as string)
                  : Number.MAX_SAFE_INTEGER
              }
              min={0}
              onChange={(e: any) => {
                shipping.qta = Number.parseInt(e.target.value);
                this.setState({});
              }} />
            <div><small>{this.props.t('max.')} {this.getResidualQtaForSensorType(shipping.sensorType as string)}</small></div>
          </Form.Group>
        </Col>
      </Form.Row>);
    }
    return shippings;
  };

  addShipping = () => {
    if (!this.state.data.lineItems || this.state.data.lineItems.length === 0) {
      return;
    }
    const shippings = this.state.data.shippingAddresses || [];
    shippings.push({ qta: 0 });
    this.state.data.shippingAddresses = shippings;
    this.setState({ data: this.state.data });
  };

  deleteShipping = (shipping: { qta: number, sensorType?: string, address?: IAddress }) => {
    const shippingAddressId = `${shipping.address?.address}|${shipping.address?.city}|${shipping.address?.postcode}`.toLowerCase();
    this.state.data.shippingAddresses = this.state.data.shippingAddresses?.filter((sa) => {
      const addressId = `${sa.address?.address}|${sa.address?.city}|${sa.address?.postcode}`.toLowerCase();
      return addressId !== shippingAddressId;
    });
    this.setState({});
  };

  getResidualQtaForSensorType = (sensorType: string) => {
    const totalQta = this.state.data.lineItems?.filter((li) => li.name === sensorType)
      .map((li) => li.sensorsQuantity)
      .reduce((a, b) => a + b, 0);
    const assignedQta = this.state.data.shippingAddresses?.filter((sa) => sa.sensorType === sensorType)
      .map((sa) => sa.qta)
      .reduce((a, b) => a + b, 0);
    return (totalQta || 0) - (assignedQta || 0);
  };

  formShop = () => (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId='phone'>
          <Form.Label>{this.props.t('PHONE')}</Form.Label>
          <Form.Control placeholder={this.props.t('PHONE')} type='text'
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='mail'>
          <Form.Label>{this.props.t('MAIL')}</Form.Label>
          <Form.Control placeholder={this.props.t('MAIL')} required type='email'
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='atmotube_qty'>
          <Form.Label>{this.props.t('ATMOTUBE_QTY')}</Form.Label>
          <Form.Control placeholder={this.props.t('ATMOTUBE_QTY')} required type='number'
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='atmotube_price'>
          <Form.Label>{this.props.t('PRICE')}</Form.Label>
          <Form.Control placeholder={this.props.t('PRICE')} required type='number' step="0.1"
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='airqino_qty'>
          <Form.Label>{this.props.t('AIRQINO_QTY')}</Form.Label>
          <Form.Control placeholder={this.props.t('AIRQINO_QTY')} required type='number'
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='airqino_price'>
          <Form.Label>{this.props.t('PRICE')}</Form.Label>
          <Form.Control placeholder={this.props.t('PRICE')} required type='number' step="0.1"
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='awair_qty'>
          <Form.Label>{this.props.t('AWAIR_QTY')}</Form.Label>
          <Form.Control placeholder={this.props.t('AWAIR_QTY')} required type='number'
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='awair_price'>
          <Form.Label>{this.props.t('PRICE')}</Form.Label>
          <Form.Control placeholder={this.props.t('PRICE')} required type='number'
            step="0.1" onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='arianna_qty'>
          <Form.Label>{this.props.t('ARIANNA_QTY')}</Form.Label>
          <Form.Control placeholder={this.props.t('ARIANNA_QTY')} required type='number'
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='arianna_price'>
          <Form.Label>{this.props.t('PRICE')}</Form.Label>
          <Form.Control placeholder={this.props.t('PRICE')} required type='number' step="0.1"
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='total_net'>
          <Form.Label>{this.props.t('TOTAL_NET')}</Form.Label>
          <Form.Control placeholder={this.props.t('TOTAL_NET')} required type='number' step="0.1"
            onChange={this.onChangeValue} />
        </Form.Group>
        <Form.Group as={Col} controlId='vat'>
          <Form.Label>{this.props.t('VAT')}</Form.Label>
          <Form.Control placeholder={this.props.t('VAT')} required type='number' step="0.1"
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Row>
        <Form.Group as={Col} controlId='total'>
          <Form.Label>{this.props.t('TOTAL')}</Form.Label>
          <Form.Control placeholder={this.props.t('TOTAL')} required type='number' step="0.1"
            onChange={this.onChangeValue} />
        </Form.Group>
      </Form.Row>
      <Form.Group controlId='paymentType'>
        <Form.Label>{this.props.t('PAYMENT_TYPE')}</Form.Label>
        <Dropdown as={ButtonGroup} className='w-100'>
          <Form.Control required={true}
            type='text'
            onChange={this.paymentTypeChanged}
            placeholder={this.props.t('PAYMENT_TYPE')}
            readOnly={true}
            value={this.state.data.paymentType?.toString()}
          />
          <Dropdown.Toggle />
          <Dropdown.Menu>
            {Object.values(PaymentType).map(
              (payment) => <Dropdown.Item key={payment} eventKey={payment} onSelect={this.paymentTypeSelected}>
                {payment}
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Form.Group>
    </>
  );

  /* eslint-disable i18next/no-literal-string */
  formPrice = () => (
    <>
      <Form.Row>
        <h6 style={{ flex: 1, fontWeight: 'bold' }}>{this.props.t('SUBTOTAL')}</h6>
        <h6>{getSubtotal(this.state.data.lineItems as any[])}</h6>
      </Form.Row>
      <Form.Row>
        <h6 style={{ flex: 1, fontWeight: 'bold' }}>{this.props.t('VAT')}</h6>
        <h6>{getTotalVat(this.state.data.lineItems as any[])}</h6>
      </Form.Row>
      <Form.Row>
        <h6 style={{ flex: 1, fontWeight: 'bold' }}>{this.props.t('TOTAL')}</h6>
        <h6 style={{ fontWeight: 'bold' }}>{getTotal(this.state.data.lineItems as any[])}</h6>
      </Form.Row>
      <Form.Row>
        <Form.Group style={{ flex: 1 }} controlId='paymentType'>
          <Dropdown as={ButtonGroup} className='w-100'>
            <Form.Control required={true}
              type='text'
              onChange={this.paymentTypeChanged}
              placeholder={this.props.t('PAYMENT_TYPE')}
              readOnly={true}
              value={this.state.data?.paymentType?.toString()}
            />
            <Dropdown.Toggle />
            <Dropdown.Menu>
              {Object.values(PaymentType).map(
                (payment) => <Dropdown.Item key={payment} eventKey={payment} onSelect={this.paymentTypeSelected}>
                  {payment}
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Form.Group>
      </Form.Row>
    </>
  );

  render() {
    const { sensorsForm, rewardsForm } = this.state;
    return (
      <Container fluid>
        <Form>
          <Row className='w-100 justify-content-center'>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <h2>
                  {this.props.t('ORDER')}
                </h2>
              </Card.Header>
              <Card.Body>
                {this.formOrder()}
              </Card.Body>
            </Card>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <h2>
                  {this.props.t('SENSORS')}
                </h2>
              </Card.Header>
              <Card.Body>
                {sensorsForm}
              </Card.Body>
              <Card.Footer>
                <Button
                  variant='primary'
                  className='float-right'
                  onClick={() => this.setState({
                    sensorsForm: [...sensorsForm,
                    <SensorsForm key={sensorsForm.length} index={sensorsForm.length}
                      onChangeValue={this.onChangeValueSensor}
                      onTypeSelected={(a) => this.onChangeSensorType(a, sensorsForm.length)} />]
                  })}
                >
                  {this.props.t('+')}
                </Button>
              </Card.Footer>
            </Card>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <h2>
                  {this.props.t('PRICE')}
                </h2>
              </Card.Header>
              <Card.Body>
                {this.formPrice()}
              </Card.Body>
            </Card>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <h2>{this.props.t('SHIPPING')}</h2>
              </Card.Header>
              <Card.Body>
                {this.formShippings()}
                {this.state.data.shippingAddresses?.length === 0 &&
                  <div style={{ textAlign: 'center' }}>
                    <Button variant='primary' onClick={this.addShipping}>
                      {this.props.t('ADD_SHIPPING')}
                    </Button>
                  </div>}
              </Card.Body>
              {this.state.data.shippingAddresses?.length !== 0 &&
                <Card.Footer>
                  <Button variant='primary' className='float-right' onClick={this.addShipping}>
                    {this.props.t('+')}
                  </Button>
                </Card.Footer>}
            </Card>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <h2>
                  {this.props.t('REWARDS')}
                </h2>
              </Card.Header>
              <Card.Body>
                {rewardsForm}
              </Card.Body>
              <Card.Footer>
                <Button
                  variant='primary'
                  className='float-right'
                  onClick={() => this.setState({
                    rewardsForm: [...rewardsForm,
                    <RewardForm key={rewardsForm.length} index={rewardsForm.length} onChangeValue={this.onChangeValue} />]
                  })}
                >
                  {this.props.t('+')}
                </Button>
              </Card.Footer>
            </Card>
          </Row>
          <Row className='w-100 justify-content-center'>
            <Button variant='success' onClick={this.savePurchase}>{this.props.t('SAVE')}</Button>
          </Row>
        </Form>

      </Container>
    );
  }

}

export default withTranslation()(AddPurchase);
export type {
  IOrder
};