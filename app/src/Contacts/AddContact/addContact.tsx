import React, { ChangeEvent, createRef, FormEvent } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import axios from 'axios';

import AddressForm from '../../Components/AddressForm';
import CompanyForm from './companyForm';
import ICompany from '../../Model/companyType';
import IContact from '../../Model/iContactType';
import IAddress from '../../Model/addressType';
import constants from '../../constants';
import { message } from 'antd';

interface IAddContactData extends Partial<IContact> {
  company?: Partial<ICompany>,
  addresses?: Partial<IAddress>[]
}

interface IAddContactState {
  data: IAddContactData
  loading: boolean,
  showCompanyForm: boolean
}

class AddContact extends React.Component<WithTranslation, IAddContactState> {

  private form = createRef<HTMLFormElement>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false,
      data: {},
      showCompanyForm: false
    };
  }

  saveContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(this.state.data);
    this.state.data?.addresses?.map((address: Partial<IAddress & { postalcode?: string }>) => {
      address.postcode = address.postalcode;
      delete address.postalcode;
    });
    const form = event.currentTarget;
    if (form.checkValidity()) {
      this.setState({ loading: true });
      axios.post(constants.api.addContact, this.state.data)
        .then(() => {
          this.setState({ loading: false, data: {} });
          form.reset();
          message.success({
            content: this.props.t('CONTACT_ADDED'),
            style: {
              marginTop: 100
            }
          });
        })
        .catch((reason: any) => {
          console.log(reason);
          message.success({
            content: this.props.t('EMAIL_EXIST'),
            style: {
              marginTop: 100
            }
          });
        });
    } 
  };

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;
    const { data } = this.state;
    Object.assign(data, { [field]: value });
    this.setState({ data });
  };

  contactInfo = () => (
    <>
      <h2>{this.props.t('CONTACT_INFO')}</h2>
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
    </>
  );

  companyForm = () => <>
    <div className="text-right">
      {
        !this.state.showCompanyForm &&
        <Button className="mb-5" variant='success' size="sm"
          onClick={() => this.setState({ showCompanyForm: true })}
        >
          {this.props.t('ADD_COMPANY')}
        </Button>
      }
    </div>
    {
      this.state.showCompanyForm &&
      <div className="mt-5">
        <h2>{this.props.t('COMPANY_INFO')}</h2>
        <CompanyForm onCompanyChange={this.onCompanyChange}></CompanyForm>
      </div>
    }
    {
      this.state.showCompanyForm &&
      <div className="text-right mb-5">
        <Button variant='danger' size="sm"
          onClick={() => {
            const { data } = this.state;
            data.company = undefined;
            this.setState({ showCompanyForm: false, data });
          }}
        >
          {this.props.t('REMOVE_COMPANY')}
        </Button>
      </div>
    }
  </>;

  onCompanyChange = (company: Partial<ICompany>) => {
    const { data } = this.state;
    data.company = company;
    this.setState({ data });
  };

  onChangeAddressForm = (e: any, index: number) => {
    const { data } = this.state;
    data.addresses = data.addresses || [];
    if (!data.addresses[index]) {
      data.addresses[index] = {};
    }
    Object.assign(data.addresses[index], { [e.target.name]: e.target.value });
    this.setState({ data });
  };

  addressForm = (address: Partial<IAddress>, index: number) => <>
    <AddressForm
      index={index}
      key={this.createrandomID()}
      address={address}
      onChangeValue={(e) => this.onChangeAddressForm(e, index)}
    />
    <div className="text-right mb-5">
      <Button variant='danger' size="sm"
        onClick={() => {
          const { data } = this.state;
          data.addresses?.splice(index, 1);
          this.setState({ data });
        }}
      >
        {this.props.t('REMOVE_ADDRESS')}
      </Button>
    </div>
  </>;

  createrandomID = () => {
    const id = Date.now();
    return id;
  };

  render() {
    const { data } = this.state;
    return (
      <Container fluid>
        <Form ref={this.form} onSubmit={this.saveContact}>
          <Row className='w-100 justify-content-center'>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <span className='mr-3'>{this.props.t('ADD_CONTACT')}</span>
              </Card.Header>
              <Card.Body>
                {this.contactInfo()}
                {this.companyForm()}
                <h2>
                  {this.props.t('CONTACT_ADDRESSES')}
                  <div className="float-right">
                    <Button variant='primary' size="sm"
                      onClick={() => {
                        data.addresses = data.addresses || [];
                        data.addresses.push({});
                        this.setState({ data });
                      }}
                    >
                      {this.props.t('+')}
                    </Button>
                  </div>
                </h2>
                {data.addresses?.map((address: Partial<IAddress>, index: number) => this.addressForm(address, index))}
              </Card.Body>

              <Card.Footer>
                <Button disabled={!this.form.current?.checkValidity()} variant='primary' type='submit'>{this.props.t('SAVE')}</Button>
              </Card.Footer>
            </Card>
          </Row>
        </Form>
      </Container>
    );
  }

}

export default withTranslation()(AddContact);