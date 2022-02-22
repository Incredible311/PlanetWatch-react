import React, { createRef, FormEvent } from 'react';
import { Button, Container, Form, Modal } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import Axios from 'axios';
import { PersonPlus } from 'react-bootstrap-icons';
import Loader from '../common-components/loader';
import TableView from '../Components/tableView';
import constants from '../constants';
import CustomAlert from '../Components/customAlert';

interface BetatestersState {
  loading: boolean,
  showError: boolean,
  errorMessage?: string,
  add: boolean
}

class Betatesters extends React.Component<WithTranslation, BetatestersState> {

  private mailControl = createRef<HTMLInputElement>();
  private table = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = { loading: false, showError: false, add: false };
  }

  private columns = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    { title: this.props.t('MAIL'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('DEVICE_TYPE'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('DEVICE_NAME'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('ALGORAND_ACCOUNT'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('ALGORAND_INFRASTRUCTURE_ACCOUNT'), field: 'mail', sorter: 'string', headerFilter: 'input' }
  ];

  saveTester = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity()) {
      this.setState({ loading: true });
      Axios.post(constants.api.addBetatester, { mail: this.mailControl.current?.value.trim() })
        .then(() => {
          form.reset();
          this.setState({ loading: false, add: false }, () => this.table.current?.reloadData());
        })
        .catch((reason: any) => {
          console.log(reason);
        });
    }
  };

  render() {
    return (
      <Container fluid>
        <Button onClick={() => this.setState({ add: true })}>
          <PersonPlus />
        </Button>
        <TableView ref={this.table} id={'betatester'} api={constants.api.getBetatesters} columns={this.columns} />
        <CustomAlert
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
        <Modal show={this.state.add} backdrop='static' keyboard={false} size='sm' centered={true} >
          <Form onSubmit={this.saveTester}>
            <Modal.Body>
              <Container>
                <Form.Group controlId='mail'>
                  <Form.Label>{this.props.t('MAIL')}</Form.Label>
                  <Form.Control required type='email' ref={this.mailControl} />
                </Form.Group>
              </Container>
            </Modal.Body>

            <Modal.Footer>
              <Button variant='success' type='submit'>{this.props.t('SAVE')}</Button>
              <Button variant='primary' onClick={() => this.setState({ add: false })}>
                {this.props.t('CLOSE')}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <Loader fullscreen={true} visible={this.state.loading} />
      </Container>
    );
  }

}

export default withTranslation()(Betatesters);