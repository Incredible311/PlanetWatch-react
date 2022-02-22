import React, { FormEvent, ChangeEvent } from 'react';
import { Container, Card, Form, Row, Button, Col } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';

interface IAddRewardData {
  address?: string,
  quantity?: number,
}

interface IAddRewardState {
  data: IAddRewardData
}

class AddReward extends React.Component<any, IAddRewardState> {

  constructor(props: any) {
    super(props);
    this.state = { data: props.data !== null && props.data !== undefined ? props.data : {} };
  }

  sendReward = (event: FormEvent<HTMLFormElement>) => {
    console.log(event);
  };

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;
    const { data } = this.state;
    switch (field) {
      case 'address': {
        data.address = value;
        break;
      }
      case 'quantity': {
        data.quantity = Number(value);
        break;
      }
      default: {
        break;
      }
    }
    this.setState({ data });
  };

  render() {
    return (
      <Container fluid>
        <Row className='w-100 justify-content-center'>
          <Card className='col-md-7 p-0'>
            <Card.Body>
              <Form.Row>
                <Form.Group as={Col} controlId='address'>
                  <Form.Label>{this.props.t('ADDRESS')}</Form.Label>
                  <Form.Control placeholder={this.props.t('ADDRESS')} required type='text' value={this.state.data?.address}
                    onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Group as={Col} controlId='quantity'>
                  <Form.Label>{this.props.t('QUANTITY')}</Form.Label>
                  <Form.Control placeholder={this.props.t('QUANTITY')} required type='number' value={this.state.data?.quantity}
                    onChange={this.onChangeValue} />
                </Form.Group>
              </Form.Row>
            </Card.Body>
            <Card.Footer>
              <Button className='float-right' variant='primary' type='submit'>{this.props.t('SEND_REWARD')}</Button>
            </Card.Footer>
          </Card>
        </Row>
      </Container>
    );
  }

}

export default withTranslation()(AddReward);