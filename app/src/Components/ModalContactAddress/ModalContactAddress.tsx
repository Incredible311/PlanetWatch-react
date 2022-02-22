import React from 'react';
import { InputGroup, Button, FormControl, Form, Row, Col } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import { withTranslation } from 'react-i18next';
import Axios from 'axios';
import constants from '../../constants';
import ContactAddressForm from '../ContactAddressForm';

class ModalContactAddressForm extends React.Component<any, any> {

  email: string = '';
  contact: any;
  newContact: any = {};
  searched: boolean = false;
  isNewContact: boolean = false;
  location: any;
  selectedContact: any;

  getContactByEmail = async (mail: string) => {
    const result = await Axios.get(`${constants.api.getContact}/${mail}`);
   // if (result.data?.data?.length === 1) this.selectedContact = result.data?.data[0];
   // this.setState({});
    if (result) {
      this.isNewContact = false;
    }
   // if (result.data?.data?.length === 0) this.selectedContact = result.data?.data;
    return result.data?.data;
  };

  onLocationChange = (location: any) => {
    this.location = location;
    this.setState({});
  };

  onChangeContact = (e: any) => {
    this.newContact[e.target.id] = e.target.value;
  };

  newContactRender = () => <>
    <Form.Group controlId='name'>
      <Form.Label>{this.props.t('NAME')}</Form.Label>
      <Form.Control required type='text' onKeyUp={this.onChangeContact} />
    </Form.Group>
    <Form.Group controlId='surname'>
      <Form.Label>{this.props.t('SURNAME')}</Form.Label>
      <Form.Control required type='text' onKeyUp={this.onChangeContact} />
    </Form.Group>
    <Form.Group controlId='mail'>
      <Form.Label>{this.props.t('MAIL')}</Form.Label>
      <Form.Control required type='text' defaultValue={this.email} onKeyUp={this.onChangeContact} />
    </Form.Group>
    <Form.Group controlId='phone'>
      <Form.Label>{this.props.t('PHONE')}</Form.Label>
      <Form.Control type='text' onKeyUp={this.onChangeContact} />
    </Form.Group>
  </>;

  contactRender = () => <>
    {
      this.contact?.map((item: any) => {
        return <>
        <hr></hr>
          <Row style={{ marginTop: 10 }}><Col><Form.Label>{this.props.t('CONTACT')}</Form.Label></Col>
            <Col>
              <input type="checkbox"
                onChange={() => {
                  this.selectedContact = item;
                }}></input>
            </Col></Row>
          <Row>
            <Col>{this.props.t('NAME')} {this.props.t('SURNAME')}</Col>
            <Col>{item.name} {item.surname}</Col>
          </Row>
          <Row>
            <Col>{this.props.t('EMAIL')}</Col>
            <Col>{item.mail}</Col>
          </Row>
          <Row>
            <Col>{this.props.t('PHONE')}</Col>
            <Col>{item.phone}</Col>
          </Row>
        </>;
      })
    }
  </>;

  save = () => {
    if (!this.contact) {
      this.contact = this.newContact;
    }
    this.props.onSave({ contact: this.selectedContact ? this.selectedContact : this.newContact, location: this.location });
  };

  render = () => {
    return <>
      <Form.Label>{this.props.t('SEARCH_CONTACT')}</Form.Label>

      <InputGroup className="mb-3">
        <FormControl defaultValue={this.email} onKeyUp={(e: any) => { this.email = e.target.value; }} />
        <InputGroup.Append>
          <Button variant="primary" onClick={() => {
            if (this.email) {
              this.getContactByEmail(this.email).then((contact) => {
                if (contact?.length === 1) this.selectedContact = contact[0];
                this.contact = contact;
                this.searched = true;
                this.setState({});
              });
            }
          }}>
            <Search />
          </Button>
        </InputGroup.Append>
      </InputGroup>
      {
        this.searched && this.contact.length === 0 &&
        <>
          {
            !this.isNewContact &&
            <Button variant="primary" onClick={() => {
              this.isNewContact = true;
              this.newContact.mail = this.email;
              this.setState({});
            }}>
              {this.props.t('ADD_CONTACT')}
            </Button>
          }
          <div style={{ padding: '0.5rem' }}>
            {this.isNewContact && this.newContactRender()}
          </div>
        </>
      }
      <div style={{ padding: '0.5rem' }}>
        {this.searched && this.contact && this.contactRender()}
      </div>
      <div>
        {
          (this.contact || this.isNewContact) &&
          <ContactAddressForm
            canAddAddress={true}
            email={this.contact?.mail}
            onChange={this.onLocationChange}
          />
        }
      </div>
      <div style={{ marginTop: '1em' }}>
        {
          this.location &&
          <Button variant="primary" className="float-right addButton" onClick={this.save}>
            {this.props.t('SAVE')}
          </Button>
        }
      </div>
    </>;
  };

}

export default withTranslation()(ModalContactAddressForm);