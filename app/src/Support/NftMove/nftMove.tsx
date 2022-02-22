import Axios, { AxiosError, AxiosResponse } from 'axios';
import React, { ChangeEvent } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import Loader from '../../common-components/loader';
import CustomAlert, { CustomAlertType } from '../../Components/customAlert';
import constants from '../../constants';
import NftMoveRequest from '../../Model/nftMoveRequest';

interface NftMoveState {
  loading: boolean;
  showError: boolean;
  errorMessage?: string;
  validated: boolean;
  errorType: CustomAlertType;
  newAccount?: string;
  oldAccount?: string;
  nftId?: string;
  clawback?: boolean;
}

class NftMove extends React.Component<WithTranslation, NftMoveState> {

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false,
      showError: false,
      errorType: CustomAlertType.ALERT,
      validated: false,
      clawback: false
    };
  }

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;

    switch (field) {
      case 'oldAccount': {
        this.setState({ oldAccount: value });
        break;
      }
      case 'newAccount': {
        this.setState({ newAccount: value });
        break;
      }
      case 'nftId': {
        this.setState({ nftId: value });
        break;
      }
      case 'clawback': {
        this.setState({ clawback: e.target.checked });
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
      const submitData: NftMoveRequest = {
        oldAccount: this.state.oldAccount!,
        newAccount: this.state.newAccount!,
        allowClawback: this.state.clawback!
      };
      this.setState({ loading: true });
      Axios.post(constants.api.nftMove.replace('{nftId}', this.state.nftId!), submitData).then((res: AxiosResponse) => {
        this.setState({ loading: false });
        if (res.data.success) {
          this.setState({
            loading: false,
            showError: true,
            errorMessage: `Sensore aggiunto, id: ${res.data.data.id}`,
            errorType: CustomAlertType.INFO
          });
          form.reset();
        } else {
          this.setState({
            loading: false,
            showError: true,
            errorMessage: JSON.stringify(res.data),
            errorType: CustomAlertType.ALERT
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
    const { newAccount, oldAccount, nftId } = this.state;
    return (
      <Container fluid className='d-flex'>
        <Loader visible={this.state.loading} fullscreen={true} />
        <Row className='w-100 justify-content-center'>
          <Card className='col-md-7 p-0'>
            <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
              <Card.Header>{this.props.t('NFT_MOVE')}</Card.Header>
              <Card.Body>
                <Form.Group controlId='nftId'>
                  <Form.Label>{this.props.t('NFT_ID')}</Form.Label>
                  <Form.Control required={true} type='text' placeholder={this.props.t('NFT_ID')}
                    value={nftId} onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Group controlId='oldAccount'>
                  <Form.Label>{this.props.t('OLD_ACCOUNT')}</Form.Label>
                  <Form.Control required={true} type='text' placeholder={this.props.t('OLD_ACCOUNT')}
                    value={oldAccount} onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Group controlId='newAccount'>
                  <Form.Label>{this.props.t('NEW_ACCOUNT')}</Form.Label>
                  <Form.Control required={true} type='text' placeholder={this.props.t('NEW_ACCOUNT')}
                    value={newAccount} onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="clawback">
                  <Form.Check type="checkbox" label="Clawback" onChange={this.onChangeValue} />
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

export default withTranslation()(NftMove);