import React from 'react';
import { Form, Col } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { withTranslation } from 'react-i18next';

class RewardForm extends React.Component<any, any> {

  constructor(props: any) {
    super(props);

    this.state = {
      date: null,
      calendar: false
    };
  }

  onChangeDate = (date: Date | Date[] | null | undefined) => {
    this.setState({ date });
  };

  render() {
    return (
      <>
        <Form.Row>
          <Form.Group as={Col} controlId={`rewardDate${this.props.index}`}>
            <Form.Label>{this.props.t('DATE')}</Form.Label>
            <Form.Control placeholder={this.props.t('DATE')} type='text' value={this.state.date?.toLocaleString().split(',')[0]}
              onClick={() => this.setState({ calendar: true })} onBlur={() => setTimeout(() => this.setState({ calendar: false }), 1000)} />
            {this.state.calendar && <Calendar onChange={this.onChangeDate} value={this.state.date} />}
          </Form.Group>
          <Form.Group as={Col} controlId={`rewardQuantity${this.props.index}`}>
            <Form.Label>{this.props.t('QUANTITY')}</Form.Label>
            <Form.Control placeholder={this.props.t('QUANTITY')} type='number'
              onChange={this.props.onChangeValue} />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId={`rewardAccount${this.props.index}`}>
            <Form.Label>{this.props.t('ACCOUNT')}</Form.Label>
            <Form.Control placeholder={this.props.t('ACCOUNT')} type='text'
              onChange={this.props.onChangeValue} />
          </Form.Group>
        </Form.Row>
        <hr/>
      </>
    );
  }

}

export default withTranslation()(RewardForm);
