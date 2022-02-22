import Axios, { AxiosError, AxiosResponse } from 'axios';
import React, { ChangeEvent } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import Loader from '../../common-components/loader';
import CustomAlert, { CustomAlertType } from '../../Components/customAlert';
import constants from '../../constants';
import ClawbackRequest from '../../Model/clawbackRequest';

interface ClawbackState {
  loading: boolean;
  showError: boolean;
  errorMessage?: string;
  validated: boolean;
  errorType: CustomAlertType;
  account?: string;
  nftId?: string;
}

class Clawback extends React.Component<WithTranslation, ClawbackState> {

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false,
      showError: false,
      errorType: CustomAlertType.ALERT,
      validated: false
    };
  }

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;

    switch (field) {
      case 'account': {
        this.setState({ account: value });
        break;
      }
      case 'nftId': {
        this.setState({ nftId: value });
        break;
      }
      default:
        break;
    }
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity()) {
      const submitData: ClawbackRequest = {
        account: this.state.account!
      };
      this.setState({ loading: true });
      Axios.post(constants.api.clawback.replace('{nftId}', this.state.nftId!), submitData).then((res: AxiosResponse) => {
        this.setState({ loading: false });
        if (res.data.success) {
          this.setState({
            loading: false,
            showError: true,
            errorMessage: `Sensore aggiunto, id: ${res.data.data.id}`,
            errorType: CustomAlertType.SUCCESS
          });
          form.reset();
        } else {
          this.setState({
            loading: false,
            showError: true,
            errorMessage: JSON.stringify(res.data),
            errorType: CustomAlertType.ERROR
          });
        }
      }).catch((reason: AxiosError) => {
        this.setState({ loading: false, showError: true, errorMessage: reason.message, errorType: CustomAlertType.ALERT });
      });
    }
    this.setState({ validated: true });
  };

  render() {
    /* eslint-disable i18next/no-literal-string */
    const { account, nftId } = this.state;
    return (
      <Container fluid className='d-flex'>
        <Loader visible={this.state.loading} fullscreen={true} />
        <Row className='w-100 justify-content-center'>
          <Card className='col-md-7 p-0'>
            <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
              <Card.Header>Move nft to creator account</Card.Header>
              <Card.Body>
                <Form.Group controlId='nftId'>
                  <Form.Label>{this.props.t('NFT_ID')}</Form.Label>
                  <Form.Control required={true} type='text' placeholder={this.props.t('NFT_ID')}
                    value={nftId} onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Group controlId='account'>
                  <Form.Label>{this.props.t('ACCOUNT')}</Form.Label>
                  <Form.Control required={true} type='text' placeholder={this.props.t('ACCOUNT')}
                    value={account} onChange={this.onChangeValue} />
                </Form.Group>
              </Card.Body>
              <Card.Footer>
                <Button type='submit'>{this.props.t('MOVE')}</Button>
              </Card.Footer>
            </Form>
          </Card>
        </Row>
        <CustomAlert
          show={this.state.showError}
          message={this.state.errorMessage}
          type={this.state.errorType}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </Container>
    );
  }

}

export default withTranslation()(Clawback);