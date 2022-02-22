import React from 'react';
import { Row, Col } from 'react-bootstrap';

class DownloadTransactionForm extends React.Component<{
  changeFromDate: Function,
  t: Function,
  changeToDate: Function,
  fromDate: string,
  toDate: string
}, any> {

  render() {
    return <div>
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

export default DownloadTransactionForm;