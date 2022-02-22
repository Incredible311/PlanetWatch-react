import React, { createRef } from 'react';
import Axios from 'axios';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import TableView from '../Components/tableView';
import constants from '../constants';
import CustomAlert from '../Components/customAlert';

interface SensersOwnersState {
  loading: boolean,
  page: number,
  pages: number,
  showModal: boolean,
  selectedRow?: any,
  showError: boolean,
  errorMessage?: string,
  currentContact?: any
}

class SensorsOwners extends React.Component<WithTranslation, SensersOwnersState> {

  private mainTable = createRef<TableView>();
  private personalTable = createRef<TableView>();
  private businessTable = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: true,
      page: 1,
      pages: 1,
      showModal: false,
      showError: false
    };
  }

  /* eslint-disable i18next/no-literal-string */
  private columns = [
    {
      title: this.props.t('SENSOR_ID'), field: 'sensorId', sorter: 'string', headerFilter: 'input'
    },
    {
      title: this.props.t('NAME'),
      field: 'ownerName',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('TYPE'),
      field: 'ownerType',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('MAIL'),
      field: 'ownerEmail',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('GEO'),
      field: 'geo',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('ACCOUNT_OWNER'),
      field: 'ownerAccount',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('ACCOUNT_INFRASTRUCTURE'),
      field: 'ownerInfrastructure',
      sorter: 'string',
      headerFilter: 'input'
    }
  ];

  private columnsPersonal = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    { title: this.props.t('SURNAME'), field: 'surname', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('NAME'), field: 'name', sorter: 'string', headerFilter: 'input' }
  ];

  private columnsBusiness = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    { title: this.props.t('NAME'), field: 'business_name', sorter: 'string', headerFilter: 'input' }
  ];

  closeModal = (save: boolean) => {
    if (save) {
      const personalSelected = this.personalTable?.current?.getSelectedData();
      // const businessSelected = this.businessTable?.current?.getSelectedData();
      const selected = this.state.selectedRow;

      const calls = [];
      console.log(personalSelected);
      if (personalSelected.length > 0) {
        // Selected
        if (selected.opid === null || selected.opid !== personalSelected[0].id) {
          calls.push({
            url: constants.api.addOwnerPersonalDeviceLink
              .replace('{sensorId}', selected.sid)
              .replace('{personalId}', personalSelected[0].id),
            post: true
          });
        }
      } else if (selected.opid !== null) {
        // Already setted personal...
        calls.push({
          url: constants.api.deleteOwnerPersonalDeviceLink.replace('{sensorId}', selected.sid),
          post: false
        });
      }

      // if (businessSelected.length > 0) {
      //   // Selected
      //   if (selected.obid === null || selected.obid !== businessSelected[0].id) {
      //     calls.push({
      //       url: constants.api.addOwnerBusinessDeviceLink
      //         .replace('{sensorId}', selected.sid)
      //         .replace('{businessId}', businessSelected[0].id),
      //       post: true
      //     });
      //   }
      // } else if (selected.obid !== null) {
      //   // Already setted personal...
      //   calls.push({
      //     url: constants.api.deleteOwnerBusinessDeviceLink.replace('{sensorId}', selected.sid),
      //     post: false
      //   });
      // }
      if (calls.length > 0) {
        // eslint-disable-next-line no-debugger
        debugger;
        this.callSequentially(calls, 0).then(() => {
          this.mainTable.current?.reloadData();
          this.setState({ showModal: false });
        }).catch((reason: any) => this.setState({ showError: true, errorMessage: reason }));
      }
    } else {
      this.setState({ showModal: false });
    }
  };

  async callSequentially(calls: any[], index: number): Promise<any> {
    if (calls.length > index) {
      const current = calls[index];
      if (current.post) {
        await Axios.post(current.url);
      } else {
        await Axios.delete(current.url);
      }
      return this.callSequentially(calls, index + 1);
    }
    return Promise.resolve(true);
  }

  onRowSelected = async (row: any) => {
    /* eslint-disable no-underscore-dangle */
    const currentContact = await Axios.get(`${constants.api.getContact}/${row._row.data.ownerEmail}`);
    this.setState({ showModal: true, selectedRow: row._row.data, currentContact: currentContact.data?.data[0] });
  };

  render() {
    return (
      <Container fluid>
        <TableView
          ref={this.mainTable}
          api={constants.api.getSensorsOwners}
          id={'sensors-owner-list'}
          columns={this.columns}
          onRowSelected={this.onRowSelected} />
        <Modal show={this.state.showModal} backdrop='static' keyboard={false} size='xl' >

          <Modal.Body>
            <Container>
              <Row>
                <Col>
                  <table>
                    <tbody>
                      <tr>
                        <th>{this.props.t('MAIL')}:</th>
                        <td>{this.state.currentContact?.mail}</td>
                      </tr>
                      <tr>
                        <th>{this.props.t('NAME')}:</th>
                        <td>{this.state.currentContact?.name}</td>
                      </tr>
                      <tr>
                        <th>{this.props.t('SURNAME')}:</th>
                        <td>{this.state.currentContact?.surname}</td>
                      </tr>
                      <tr>
                        <th>{this.props.t('PHONE')}</th>
                        <td>{this.state.currentContact?.phone}</td>
                      </tr>
                    </tbody>
                  </table>
                </Col>
              </Row>
            </Container>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='secondary' onClick={() => this.closeModal(false)}>{this.props.t('CLOSE')}</Button>
          </Modal.Footer>
        </Modal>
        <CustomAlert
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </Container>
    );
  }

}

export default withTranslation()(SensorsOwners);