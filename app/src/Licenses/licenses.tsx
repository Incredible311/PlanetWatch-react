import Axios, { AxiosResponse } from 'axios';
import React, { ChangeEvent, createRef } from 'react';
import { Button, Card, Container, Form, Modal, Row } from 'react-bootstrap';
import { ArrowsMove, Trash } from 'react-bootstrap-icons';
import { withTranslation, WithTranslation } from 'react-i18next';
import { reactFormatter } from 'react-tabulator';
import validator from 'validator';
import Loader from '../common-components/loader';
import CustomAlert from '../Components/customAlert';
import TableView from '../Components/tableView';
import constants from '../constants';
import ChangeMailRequest from '../Model/changeMailRequest';
import './licenses.scss';

interface LicenseState {
  loading: boolean,
  showError: boolean,
  errorMessage?: string,
  isFreeLicense: boolean,
  isConfirmedFreeLicense: boolean,
  showModal: boolean,
  validated: boolean,
  newMail: string,
  licenseId: number
}

/* eslint-disable i18next/no-literal-string */
function Actions(context: any) {
  // eslint-disable-next-line no-underscore-dangle
  const cellData = context.cell._cell.row.data;
  return <>
    <Button onClick={() => { context.props.changeMail(cellData.id); }} size="sm"
      style={{ marginRight: '1em', background: 'green' }} color='danger'>
      <ArrowsMove />
    </Button>
    <Button onClick={() => { context.props.freeLicense(cellData.id); }} size="sm" style={{ background: 'red' }}
      color='danger'>
      <Trash />
    </Button>
  </>;
}

// Aggiungere NFTAssetID in tabella e in alert 
class Licenses extends React.Component<WithTranslation, LicenseState> {

  private licensesTable = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false,
      showError: false,
      isFreeLicense: false,
      isConfirmedFreeLicense: false,
      showModal: false,
      validated: false,
      newMail: '',
      licenseId: 0
    };
  }

  /* eslint-disable i18next/no-literal-string */
  private columns = [
    {
      title: this.props.t('ID'),
      field: 'id',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('NFT'),
      field: 'nft',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('SENSOR_ID'),
      field: 'sensorId',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('TYPE'),
      field: 'type',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('MAIL'),
      field: 'mail',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('ACTIVATION_DATE'),
      field: 'activationDate',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('EXPIRATION_DATE'),
      field: 'expirationDate',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('TRANSFERABLE'),
      field: 'transferable',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: '',
      sortable: false,
      formatter: reactFormatter(<Actions props={{
        freeLicense: this.freeLicense.bind(this),
        changeMail: this.changeMail.bind(this)
      }} />),
      headerSort: false
    }
  ];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async changeMail(id: number) {
    // eslint-disable-next-line no-alert
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    console.log(`clicked${id}`);

    this.setState({ showModal: true, licenseId: id });

    return null;
  }

  closeModal = () => this.setState({ showModal: false });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async freeLicense(id: number) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const check = window.confirm(this.props.t('CONFIRM_LICENSE_FREE'));
    this.setState({ isFreeLicense: true, isConfirmedFreeLicense: check });
    if (check) {
      this.setState({ loading: true });
      Axios.post(constants.api.freeLicense.replace('{licenseId}', String(id)))
        .then((res: AxiosResponse) => {
          if (res.data.success === true) {
            this.licensesTable.current?.reloadData();
          }
        })
        .catch((error) => {
          this.setState({ showError: true, errorMessage: error.message });
        })
        .finally(() => this.setState({ loading: false }));
    }
    return null;
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;

    console.log(this.state.newMail);
    if (form.checkValidity()) {
      if (validator.isEmail(this.state.newMail)) {
        this.setState({ validated: true, showModal: false, loading: true });
        const submitData: ChangeMailRequest = {
          mail: this.state.newMail
        };
        Axios.post(constants.api.changeMail.replace('{licenseId}', String(this.state.licenseId)), submitData)
          .then((res: AxiosResponse) => {
            if (res.data.success === true) {
              this.licensesTable.current?.reloadData();
            }
          })
          .catch((error) => {
            console.log(error);
            this.setState({ showError: true, errorMessage: error.message });
          })
          .finally(() => this.setState({ loading: false }));
      }
    } else {
      this.setState({ validated: false });
    }
  };

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;

    switch (field) {
      case 'newMail': {
        this.setState({ newMail: value });
        break;
      }
      default:
        break;
    }
  };

  render() {
    const { newMail } = this.state;
    return (
      <Container fluid>
        <Modal show={this.state.showModal} backdrop={true} keyboard={true} size='xl' onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>Change Mail</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container>
              <Row className='w-100 justify-content-center'>
                <Card className='col-md-7 p-0'>
                  <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Card.Header>{this.props.t('CHANGE_ACCOUNT')}</Card.Header>
                    <Card.Body>
                      <Form.Group controlId='newMail'>
                        <Form.Label>{this.props.t('NEW_MAIL')}</Form.Label>
                        <Form.Control required={true} type='text' placeholder={this.props.t('NEW_MAIL')}
                          value={newMail} onChange={this.onChangeValue} />
                      </Form.Group>
                    </Card.Body>
                    <Card.Footer>
                      <Button type='submit'>{this.props.t('CHANGE')}</Button>
                    </Card.Footer>
                  </Form>
                </Card>
              </Row>
            </Container>
          </Modal.Body>
        </Modal>
        <Loader fullscreen={true} visible={this.state.loading} />
        <TableView id={'licences'} ref={this.licensesTable} api={constants.api.getLicenses} columns={this.columns} />
        <CustomAlert
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </Container>
    );
  }

}

export default withTranslation()(Licenses);