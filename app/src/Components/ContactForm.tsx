import React, { ChangeEvent, FormEvent } from 'react';
// import Axios from 'axios';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';

// import constants from '../constants';
import ContactType from '../Model/contactType';
import IAddress from '../Model/addressType';
import AddressForm from './AddressForm';

interface IAddContactData {
  [key: string]: string | undefined | IAddress[],
  name?: string,
  surname?: string,
  mail?: string,
  phone?: string,
  businessName?: string,
  referentName?: string,
  referentSurname?: string,
  algoAccount?: string,
  algoInfrastructureAccount?: string,
  addresses?: IAddress[]
}

interface IAddContactState {
  contactType: ContactType,
  data: IAddContactData
  loading: boolean,
  adressesForm: JSX.Element[],
  onSave: (contact: any) => any,
  onCancel: () => any
}

// TODO: Bug switch personal dopo il save cambia da solo
// TODO: Aggiungere via, cap ecc... indirizzi possono essere multipli...
class ContactForm extends React.Component<WithTranslation & { [key: string]: any }, IAddContactState> {

  constructor(props: WithTranslation & { [key: string]: any }) {
    super(props);
    this.state = {
      loading: false,
      contactType: ContactType.PERSONAL,
      data: (props as any).data || {},
      adressesForm: [<AddressForm key={0} index={0} onChangeValue={this.onChangeValue} />],
      onSave: props.onSave || ((contact: any) => console.log(contact)),
      onCancel: props.onCancel || (() => { })
    };
  }

  toggleType = (checked: boolean) => {
    let type;
    if (checked) {
      type = ContactType.PERSONAL;
    } else {
      type = ContactType.BUSINESS;
    }
    this.setState({ contactType: type, data: {} });
  };

  saveContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.state.onSave(this.state.data);
    // const form = event.currentTarget;
    // if (form.checkValidity()) {
    //     this.setState({ loading: true });
    //     Axios.post(this.state.contactType === ContactType.PERSONAL
    //         ? constants.api.addPersonalContact
    //         : constants.api.addBusinessContact, this.state.data)
    //         .then(() => {
    //             this.setState({ loading: false });
    //             form.reset();
    //         })
    //         .catch((reason: any) => {
    //             console.log(reason);
    //         });
    // }
  };

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field: string = e.target.id;
    const { value } = e.target;
    const { data } = this.state;
    data[field] = value;
    this.setState({ data });
  };

  personal = () => (
    <>
      <Form.Group controlId='name'>
        <Form.Label>{this.props.t('NAME')}</Form.Label>
        <Form.Control required type='text' onChange={this.onChangeValue} />
      </Form.Group>
      <Form.Group controlId='surname'>
        <Form.Label>{this.props.t('SURNAME')}</Form.Label>
        <Form.Control required type='text' onChange={this.onChangeValue} />
      </Form.Group>
      <Form.Group controlId='mail'>
        <Form.Label>{this.props.t('MAIL')}</Form.Label>
        <Form.Control required type='text' onChange={this.onChangeValue} />
      </Form.Group>
      <Form.Group controlId='phone'>
        <Form.Label>{this.props.t('PHONE')}</Form.Label>
        <Form.Control type='text' onChange={this.onChangeValue} />
      </Form.Group>
      <Form.Group controlId='businessName'>
        <Form.Label>{this.props.t('BUSINESS_NAME')}</Form.Label>
        <Form.Control required type='text' onChange={this.onChangeValue} />
      </Form.Group>
      <Form.Group controlId='vat'>
        <Form.Label>{this.props.t('Vat number')}</Form.Label>
        <Form.Control required type='text' onChange={this.onChangeValue} />
      </Form.Group>
    </>
  );

  address = (index: number) => (
    <AddressForm index={index} key={index} onChangeValue={this.onChangeValue} />
  );

  render() {
    // const { adressesForm } = this.state;
    return (
      <Form onSubmit={this.saveContact}>
        <Row className='w-100 justify-content-center'>
          {/* <Card >
                        <Card.Header>
                            <span className='mr-3'>{this.props.t('ADD_CONTACT')}</span>
                        </Card.Header>
                        <Card.Body>
                            {this.personal()}
                            <p className="mt-4 font-bold">{this.props.t('Adresses')}</p>
                            {adressesForm}
                            <Button variant='primary'
                                onClick={() => this.setState({
                                    adressesForm: [...adressesForm,
                                    <AddressForm
                                        key={adressesForm.length}
                                        index={adressesForm.length}
                                        onChangeValue={this.onChangeValue} />]
                                })}
                            >
                                {this.props.t('+')}
                            </Button>
                        </Card.Body>

                        <Card.Footer>
                            <Button variant='primary' type='submit'>{this.props.t('SAVE')}</Button>
                        </Card.Footer>
                    </Card> */}
          <Col>
            {this.personal()}
          </Col>
        </Row>
        <Row>
          <Col>
            <Button variant='primary' onClick={this.state.onCancel}>{this.props.t('CANCEL')}</Button>
            <Button variant='primary' type='submit'>{this.props.t('SAVE')}</Button>
          </Col>
        </Row>
      </Form>
    );
  }

}

export default withTranslation()(ContactForm);