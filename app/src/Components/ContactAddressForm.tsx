import axios from 'axios';
import React, { Component } from 'react';
import { Form, Dropdown, ButtonGroup, Col, Modal, Button } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import constants from '../constants';
import IAddress from '../Model/addressType';
import AddressForm from './AddressForm';

class ContactAddressForm extends Component<any, any> {

  state = {
    locations: [],
    showForm: false,
    value: ''
  };

  private address: IAddress = {};

  constructor(props: any) {
    super(props);
    this.state = { ...props, ...this.state };
  }

  getLocations = async () => {
    const { email } = this.props;
    const locations = await axios.get(constants.api.getLocationsByContact + email);
    this.setState({ locations: locations.data.data ? locations.data.data : [] });
  };

  componentDidMount = () => {
    this.getLocations().then(() => { });
  };

  componentDidUpdate = (prevProps: any) => {
    if (prevProps.email !== this.props.email) this.getLocations();
  };

  handleClose = () => this.setState({ showForm: false });
  onChangeAddressForm = (event: any) => {
    this.address[event.target.id] = event.target.value;
  };

  saveAddress = () => {
    const { addressSaved } = this.props;
    this.handleClose();
    this.setState({ locations: [this.address, ...this.state.locations] });
    if (addressSaved) addressSaved(this.address);
  };

  render() {
    const { onChange, canAddAddress } = this.props;
    const { locations = [] } = this.state;
    return <>
      <Form.Group style={{ flex: 1 }} as={Col} controlId='paymentType'>
        <Form.Label>{this.props.t('ADDRESS')}</Form.Label>
        <Dropdown as={ButtonGroup} className='w-100'>
          <Form.Control required={true}
            type='text'
            placeholder={this.props.t('ADDRESS')}
            readOnly={true}
            value={this.state.value}
          />
          <Dropdown.Toggle />
          <Dropdown.Menu>
            {locations.map(
              (location: any, index) => <Dropdown.Item
                value={location}
                key={index}
                onSelect={() => {
                  onChange(location);
                  this.setState({ value: `${location.address}, ${location.city}, ${location.country}` });
                }}
              >
                {`${location.address}, ${location.city}, ${location.country}`}
              </Dropdown.Item>
            )}
            {
              canAddAddress &&
              <Dropdown.Item onClick={() => this.setState({ showForm: true })}>
                {this.props.t('+')} {this.props.t('ADD_ADDRESS')}
              </Dropdown.Item>
            }
          </Dropdown.Menu>
        </Dropdown>
      </Form.Group>
      <Modal show={this.state.showForm} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.t('ADDRESS')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddressForm onChangeValue={this.onChangeAddressForm} />
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.saveAddress}>{this.props.t('SAVE')}</Button>
        </Modal.Footer>
      </Modal>
    </>;
  }

}

export default withTranslation()(ContactAddressForm);
