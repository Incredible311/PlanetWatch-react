import { message, Select } from 'antd';
import axios from 'axios';
import React from 'react';
import { Button, Col, Modal, Row, Spinner } from 'react-bootstrap';
import constants from '../constants';

class SyncTransactionForm extends React.Component<{
  t: Function,
  showSyncModal: boolean,
  onComplete: Function,
  refreshPage: Function
}, any> {

  txMapper: { [key: string]: number | undefined } = {};

  constructor(props: { tx: any, t: Function, showSyncModal: boolean, onComplete: Function, refreshPage: Function }) {
    super(props);
    this.state = {
      tx: props.tx,
      isLoading: false,
      options: [],
      fromDate: '',
      toDate: '',
      noSyncOrders: [{}],
      showSyncModal: false,
      noSyncTrans: false
    };
  }

  componentDidMount = (() => {
    this.getSyncOrders();
  });

  getSyncOrders = async () => {
    if (this.state.fromDate && this.state.toDate) {
      const orders = await axios.get(`${constants.api.getSyncOrders}?from=${this.state.fromDate}&to=${this.state.toDate}`);
      if (orders?.data?.data) {
        this.setState({
          syncOrders: orders?.data?.data,
          noSyncTrans: false,
          isLoading: false
        });
      } else {
        this.setState({
          noSyncTrans: true,
          isLoading: false
        });
      }
      this.txMapper = {};
      this.state.syncOrders.map((so: any) => {
        this.txMapper[so.tx] = so.orders.length > 1 ? undefined : so.orders[0].id;
        return so;
      });

      if (!this.state.syncOrders.find((so: any) => so.orders?.length > 1)) {
        this.saveTransactions();
      }
    }
  };

  saveTransactions = () => {
    const body = Object.keys(this.txMapper).map((key: string) => {
      console.log(key);
      return { tx_id: key, fk_order: this.txMapper[key] };
    }).filter((b) => b.fk_order);
    this.props.onComplete();
    axios.put(constants.api.saveSyncOrders, body)
      .then(() => {
        message.success({
          content: `${this.props.t('TRANSACTIONS_UPDATE')}`,
          duration: 2,
          style: {
            marginTop: 100
          }
        }).then(() => { this.props.refreshPage(); });
      })
      .catch(() => {
        message.success({
          content: `${this.props.t('NO_TRANSACTIONS')}`,
          duration: 2,
          style: {
            marginTop: 100
          }
        }).then(() => { this.props.refreshPage(); });
      });
  };

  render() {
    return <div>
      {this.state.isLoading && <div className='fullscreen backdrop'>
        <Spinner animation='border' role='status' variant={'light'}>
          <span className='sr-only'>{this.props.t('LOADING')}...</span>
        </Spinner>
      </div>}
      <Modal.Header closeButton>
        <Modal.Title>{this.props.t('SYNCHRONIZE_TRANSACATIONS')}</Modal.Title>
      </Modal.Header>

      <Modal.Body >
        <Row>
          <Col md='5'>
            <span>{this.props.t('FROM')}</span>
          </Col>
          <Col md='5'>
            <span>{this.props.t('TO')}</span>
          </Col>
        </Row>
        <Row>
          <Col md='4'>
            <input style={{ height: 40 }} onChange={(e: any) => this.setState({ fromDate: e.target.value })}
              type="date" id="start" name="trip-start"
              value={this.state.fromDate} />
          </Col>
          <Col md='4'>
            <input style={{ height: 40 }} onChange={(e: any) => this.setState({ toDate: e.target.value })}
              type="date" id="start" name="trip-start"
              value={this.state.toDate} />
          </Col>
          <Col md='2'>
            <Button variant="primary" onClick={() => {
              this.setState({ isLoading: true }); this.getSyncOrders();
            }}>{this.props.t('GO')}</Button>
          </Col>
        </Row>
        {this.state.syncOrders && <Row style={{ backgroundColor: 'yellow', marginTop: 10 }}>
          <Col md='1'>
          </Col>
          <Col md='7'>
            {this.props.t('TX ID')}
          </Col>
          <Col>
            {this.props.t('ORDER_ID')}
          </Col>
        </Row>}
        <div style={{ maxHeight: '500px', overflow: 'hidden', overflowY: 'scroll' }}>
          {this.state.syncOrders?.filter((so: any) => so.orders.length > 1)
            .map((item: any, index: number) => <div key={item.tx} style={{ marginTop: 10 }}>
              <Row key={item.tx}>
                <Col md='1'>
                  <Button variant="light" onClick={() => {
                    const newSyncOrder = this.state.syncOrders.splice(index, 1);
                    delete this.txMapper[item.tx];
                    this.setState({ syncOrder: newSyncOrder });
                  }}>{this.props.t('X')}</Button>
                </Col>
                <Col md='7'>
                  <span>{item.tx}</span>
                </Col>
                <Col md='3'>
                  <Select style={{ width: '100%' }} onChange={(value) => {
                    this.txMapper[item.tx] = value;
                  }}
                    defaultValue={item?.orders[1]?.id ? '' : item.orders[0]?.id}>
                    {item.orders.map((order: any) => <Select.Option
                      key={order.id}
                      value={order.id}>
                      {order.order_id}
                    </Select.Option>)}
                  </Select>
                </Col>
              </Row>
            </div>)}
        </div>
        {this.state.noSyncTrans &&
          <b style={{ textTransform: 'uppercase' }}> {this.props.t('NO_SYNC_TRANS')}</b>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => this.setState({ showSyncModal: false })}
        >
          {this.props.t('CANCEL')}
        </Button>
        <Button variant="primary"
          onClick={() => {
            this.setState({ loading: true });
            this.saveTransactions();
          }
          }>
          {this.props.t('SYNC')}
        </Button>
      </Modal.Footer>

    </div>;
  }

}

export default SyncTransactionForm;