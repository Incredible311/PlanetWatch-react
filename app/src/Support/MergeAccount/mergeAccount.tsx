import Axios, { AxiosResponse } from 'axios';
import React, { ChangeEvent, createRef } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import validator from 'validator';
import Loader from '../../common-components/loader';
import CustomAlert, { CustomAlertType } from '../../Components/customAlert';
import MailForm from '../../Components/MailForm';
import constants from '../../constants';
import MergeContactRequest from '../../Model/mergeContactRequest';

interface IMergeAccountState {
  mails: string[],
  loading: boolean,
  contactMail: string,
  defaultMail: string,
  showError: boolean,
  errorMessage?: string
}

class MergeAccount extends React.Component<WithTranslation, IMergeAccountState> {

  private form = createRef<HTMLFormElement>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false,
      mails: [],
      contactMail: '',
      defaultMail: '',
      showError: false
    };
  }

  onChangeValueMandatory = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;

    if (field == 'primary_mail') {
      this.setState({ contactMail: value });
    } else if (field == 'default_mail') {
      this.setState({ defaultMail: value });
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChangeMailForm = (e: any, index: number) => {
    const field = e.target.id;
    const { mails } = this.state;
    const { value } = e.target;
    const mailId = Number(field);
    mails[mailId] = value;
    this.setState({ mails });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitMerge = () => {
    if (!validator.isEmail(this.state.contactMail) || !validator.isEmail(this.state.defaultMail)) {
      alert(this.props.t('EMAIL_VALIDATION'));
      return;
    } else {
      for (let i = 0; i < this.state.mails.length; i++) {
        if (!validator.isEmail(this.state.mails[i])) {
          alert(this.props.t('EMAIL_VALIDATION'));
          return;
        }
      }
    }

    let mailsNew = [];
    mailsNew.push(this.state.defaultMail);
    for (let k = 0; k < this.state.mails.length; k++) {
      mailsNew.push(this.state.mails[k]);
    }
    const submitData: MergeContactRequest = {
      mails: mailsNew
    };
    this.setState({ loading: true });
    Axios.post(constants.api.mergeContact.replace('{contactMail}', encodeURIComponent(this.state.contactMail)),
      submitData).then((res: AxiosResponse) => {
        if (res.data.success) {
          alert('Successfully merged account');
        }
      }).catch((error) => {
        this.setState({ showError: true, errorMessage: error.message });
      })
      .finally(() => this.setState({ loading: false }));
  };

  mailForm = (mail: string, index: number) => <>
    <MailForm
      index={index}
      key={this.createrandomID()}
      mail={mail}
      onChangeValue={(e) => this.onChangeMailForm(e, index)}
    />
    <div className="text-right mb-1">
      <Button variant='danger' size="sm"
        onClick={() => {
          const { mails } = this.state;
          mails?.splice(index, 1);
          this.setState({ mails });
        }}
      >
        {this.props.t('REMOVE_MAIL')}
      </Button>
    </div>
  </>;

  createrandomID = () => {
    const id = Date.now();
    return id;
  };

  render() {
    const { mails, defaultMail } = this.state;
    return (
      <Container fluid>
        <Form ref={this.form}>
          <Row className='w-100 justify-content-center'>
            <Card className='col-md-7 p-0'>
              <Card.Header>
                <span className='mr-3'>{this.props.t('MERGE_ACCOUNT')}</span>
              </Card.Header>
              <Card.Body>
                <Form.Group controlId='primary_mail'>
                  <Form.Label>Primary mail</Form.Label>
                  <Form.Control required type='text' onChange={this.onChangeValueMandatory} />
                </Form.Group>
                <h2>
                  <div className="float-right" style={{ marginBottom: '0.2em' }}>
                    <Button variant='primary' size="sm"
                      onClick={() => {
                        mails.push('');
                        this.setState({ mails });
                      }}
                    >
                      {this.props.t('+')}
                    </Button>
                  </div>
                </h2>
                <Form.Group controlId='default_mail'>
                  <Form.Label>Default mail</Form.Label>
                  <Form.Control required type='text' defaultValue={defaultMail} onChange={this.onChangeValueMandatory} />
                </Form.Group>
                {mails?.map((mail: string, index: number) => this.mailForm(mail, index))}
              </Card.Body>
              <Card.Footer>
                <Button variant='primary' onClick={this.submitMerge}>{this.props.t('MERGE')}</Button>
              </Card.Footer>
            </Card>
          </Row>
        </Form>
        <Loader fullscreen={true} visible={this.state.loading} />
        <CustomAlert
          type={CustomAlertType.ERROR}
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </Container>
    );
  }

}

export default withTranslation()(MergeAccount);