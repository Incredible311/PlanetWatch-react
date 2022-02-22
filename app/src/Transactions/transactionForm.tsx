import axios from 'axios';
import React from 'react';
import { Form, Row } from 'react-bootstrap';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import constants from '../constants';

/* eslint-disable i18next/no-literal-string */
class TransactionForm extends React.Component<{ tx: any, t: Function, isLoading: boolean, options: any, onValueChange: Function }, any> {

  constructor(props: { tx: any, t: Function, isLoading: boolean, options: any, onValueChange: Function }) {
    super(props);
    this.state = {
      tx: props.tx,
      isLoading: false,
      options: []
    };
  }

  cache: any = {};
  options: any = [];

  fontWeightBold: any = { fontWeight: 'bold' };
  fontWeightNormal: any = { fontWeight: 'normal' };

  handleInputChange = (query: any) => {
    this.setState({ query });
  };

  getOrders = async () => {
    const filter = JSON.stringify([{ field: this.props.t('order_id'), type: this.props.t('type'), value: this.state.query }]);
    const orders = await axios.get(`${constants.api.getOrders}?filters=${encodeURIComponent(filter)}`);
    this.setState({
      options: orders?.data?.data
    });
  };

  updateTransaction = async (value: any) => {
    this.setState({ tx: { ...this.state.tx, order_id: value.id } }, () => {
      this.props.onValueChange(this.state.tx);
    });
  };

  updateNote = async (value: any) => {
    this.setState({ tx: { ...this.state.tx, order_note: value || '' } }, () => {
      this.props.onValueChange(this.state.tx);
    });
  };

  handleSearch = () => {
    this.setState({ isLoading: true });
    this.getOrders();
    this.setState({ isLoading: false });
  };

  parseCurrency = (value: any) => {
    const decimals = this.state.tx.unit_decimals;
    if (value) {
      return value / (10 ** decimals);
    }
    return 0;
  };

  render() {
    return (
      <>
        <div style={{ marginLeft: 7 }}>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('TX_ID')}:
              <span style={{ fontWeight: 'normal' }}> {this.props.tx.tx_id}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('AMOUNT')}:
              <span style={this.fontWeightNormal}> {this.parseCurrency(this.props.tx.amount)}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('CURRENCY')}:
              <span style={this.fontWeightNormal}> {this.props.tx.unit_name}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('FROM')}:
              <span style={this.fontWeightNormal}> {this.props.tx.from}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('TO')}:
              <span style={this.fontWeightNormal}> {this.props.tx.to}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('FEE')}:
              <span style={this.fontWeightNormal}> {this.parseCurrency(this.props.tx.fee)}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('TYPE')}:
              <span style={this.fontWeightNormal}> {this.props.tx.type}</span></span>
          </Row>
          <Row>
            <span style={this.fontWeightBold}>{this.props.t('TX_NOTE')}:
              <span style={this.fontWeightNormal}> {this.props.tx.tx_note ? atob(this.props.tx.tx_note) : ''}</span></span>
          </Row>
        </div>
        <Form.Label>{this.props.t('ORDER_ID')}</Form.Label>
        <AsyncTypeahead
          filterBy={(option, props) => {
            const label = `${option?.order_id}`.toLowerCase();
            const searchTerm = props.text.toLowerCase();
            return label.indexOf(searchTerm) > -1;
          }}
          id='order_id'
          key={'id'}
          paginate
          labelKey={'order_id'}
          isLoading={this.props.isLoading}
          onInputChange={this.handleInputChange}
          onSearch={this.handleSearch}
          defaultInputValue={this.state?.tx?.order_id || ''}
          onChange={(value: any) => {
            console.log(value);
            this.updateTransaction(value[0]);
          }}
          onBlur={(e: any) => {
            this.setState({ order_id: e.target?.value });
          }}
          options={this.state.options || []}
          renderMenuItemChildren={(item: any) => `${item.order_id} - ${item.source}` || ''}
        />
        <Form.Group controlId='order_note' style={{ marginTop: '1rem' }}>
          <Form.Label>{this.props.t('ORDER_NOTE')}</Form.Label>
          <Form.Control value={this.state?.tx?.order_note || ''} onChange={(e) => this.updateNote(e.target.value)} as="textarea" />
        </Form.Group>
      </>
    );
  }

}

export default TransactionForm;