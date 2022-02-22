import React from 'react';
import { Row, Col } from 'react-bootstrap';

class TrackTransactionForm extends React.Component<{
  changeFromDate: Function,
  t: Function,
  changeToDate: Function,
  changeAddress: Function,
  fromDate: string,
  toDate: string,
  address: string
}, any> {

  render() {
    return <div>
      <span>{this.props.t('ADDRESS')}</span><br></br>
      <input type='text' id='wallet'
        value={this.props.address}
        onChange={(e: any) => this.props.changeAddress(e.target.value)}
        style={{ width: '70%', marginBottom: 20 }} />
      <Row>
        <Col md='5'>
          <span>{this.props.t('FROM')}</span>
        </Col>
        <Col md='5'>
          <span>{this.props.t('TO')}</span>
        </Col>
      </Row>
      <Row>
        <Col md='5'>
          <input onChange={(e: any) => this.props.changeFromDate(e.target.value)}
            type="date" id="start" name="trip-start"
            value={this.props.fromDate} />
        </Col>
        <Col md='5'>
          <input onChange={(e: any) => this.props.changeToDate(e.target.value)}
            type="date" id="start" name="trip-start"
            value={this.props.toDate} />
        </Col>
      </Row>
    </div>;
  }

}

export default TrackTransactionForm;