import { Descriptions, Tooltip } from 'antd';
import Axios, { AxiosResponse } from 'axios';
import GoogleMapReact from 'google-map-react';
import $ from 'jquery';
import { DateTime } from 'luxon';
import React, { ChangeEvent, createRef } from 'react';
import { Button, Card, Container, Form, Modal, Row } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { ArrowsMove, Mailbox2, Trash, Wrench, XOctagon } from 'react-bootstrap-icons';
import ReactDOMServer from 'react-dom/server';
import { withTranslation, WithTranslation } from 'react-i18next';
import { reactFormatter } from 'react-tabulator';
import validator from 'validator';
import Loader from '../common-components/loader';
import CustomAlert, { CustomAlertType } from '../Components/customAlert';
import Marker from '../Components/marker';
import TableView from '../Components/tableView';
import constants from '../constants';
import exclamation from '../images/exclamation.svg';
import ChangeDeviceMailRequest from '../Model/changeDeviceMailRequest';

interface SensorsState {
  showModal: boolean,
  showCheckData: boolean,
  showChangeMail: boolean,
  fixPinModal: any,
  selectedRow?: any,
  loading: boolean,
  showError: boolean,
  errorMessage?: string,
  validated: boolean,
  newMail: string,
  isChangeMail: boolean,
  sensorId: string,
  includeLicense: boolean,
  openLastData: boolean,
  cdData?: string,
  cdDate?: string,
  cdNoTransmissions: boolean,
  cdSensorId?: string,
  cdWrongData: boolean
}

function ViewIcon(table: any) {
  const rowData = table.cell.getData();
  const value = table.cell.getValue();
  return <>
    {rowData.is_autofilled === 1 ? <p>{value} <img src={exclamation}></img></p> : <p>{value}</p>}
  </>;
}

function Actions(context: any) {
  const cellData = context.cell.getData();
  return <>
    <Tooltip placement="top" title={context.props.t('CHECK_DATA')}>
      <Button size="sm" className='action-btn-yellow' color='success' onClick={(event) => {
        context.props.buttonAction(event);
        context.props.checkData(cellData.sensor_id);
      }} >
        <Icon.AlarmFill />
      </Button>
    </Tooltip>

    <Tooltip placement="top" title={context.props.t('MOVE_NFTS')}>
      <Button size="sm" className='action-btn-green' color='success' onClick={(event) => {
        context.props.buttonAction(event);
        context.props.moveNfts(cellData);
      }}>
        <ArrowsMove />
      </Button>
    </Tooltip>

    <Tooltip placement="top" title={context.props.t('CHANGE_MAIL_SENSOR')}>
      <Button size="sm" className='action-btn-green' color='success' onClick={(event) => {
        context.props.buttonAction(event);
        context.props.changeMailSensor(cellData.sensor_id);
      }} >
        <Mailbox2 />
      </Button>
    </Tooltip>

    <Tooltip placement="top" title={context.props.t('DELETE_DEVICE_OWNER')}>
      <Button size="sm" className='action-btn-red' color='danger' onClick={(event) => {
        context.props.buttonAction(event);
        context.props.deleteDeviceOwner(cellData.sensor_id);
      }}>
        <Trash />
      </Button>
    </Tooltip>

    <Tooltip placement="top" title={context.props.t('BAN_SENSOR')}>
      <Button size="sm" className={cellData?.is_banned ? 'action-btn-red' : ''} color='danger' onClick={(event) => {
        context.props.buttonAction(event);
        context.props.banSensor(cellData);
      }}>
        <XOctagon />
      </Button>
    </Tooltip>

  </>;
}

class Sensors extends React.Component<WithTranslation, SensorsState> {

  private sensorsTable = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      fixPinModal: false,
      showModal: false,
      showChangeMail: false,
      showCheckData: false,
      loading: false,
      showError: false,
      validated: false,
      newMail: '',
      isChangeMail: false,
      sensorId: '',
      includeLicense: false,
      openLastData: false,
      cdWrongData: false,
      cdNoTransmissions: false
    };
  }

  formatLastUpd = (cell: any) => {
    /* eslint-disable i18next/no-literal-string */
    cell.getElement().classList.remove('bg-info', 'bg-warning', 'bg-danger', 'bg-secondary');
    const data = cell.getData();
    let className = '';
    if (data.timeNull) {
      className = 'bg-secondary';
    } else if (data.time120) {
      className = 'bg-danger';
    } else if (data.time24) {
      className = 'bg-warning';
    } else if (data.time1) {
      className = 'bg-info';
    } else {
      className = 'bg-success';
    }
    /* eslint-enable i18next/no-literal-string */

    cell.getElement().classList.add(className);
    const value = cell.getValue();
    return this.formatDate(value);
  };

  formatDate = (date?: string) => {
    if (date !== undefined && date !== null) {
      const dateTime = DateTime.fromISO(date);
      return dateTime.setLocale('it-IT').toLocaleString(DateTime.DATETIME_SHORT);
    }
    return '-';
  };

  formatSensorName = (cell: any) => {
    const data = cell.getData();
    return this.sensorFriendlyName(data.type, data.device_number);
  };

  sensorFriendlyName = (type: string, device_number: number) => `PW:${type}_${device_number.toString().padStart(6, '0')}`;

  formatNote = (cell: any) => {
    const data = cell.getData();
    const { pin, id } = data;
    let res = '';
    if (pin !== undefined && pin !== null && (pin.startsWith('0') || /.*[a-zA-Z]+.*$/.test(pin))) {
      res = ReactDOMServer.renderToString(<>
        <Button className='fix-pin-btn' id={id} variant='link'>
          <Wrench height={20} />
        </Button>
        {this.props.t('PIN_ERROR')}
      </>);
    }
    return res;
  };

  private fixPin = (e: JQuery.ClickEvent) => {
    const sensorId = e.currentTarget.id;
    e?.stopPropagation();
    this.fixSensorPin(sensorId);
  };

  private fixSensorPin = (sensorId: string) => {
    this.setState({ loading: true });
    Axios.put(constants.api.fixPin.replace('{sensorId}', sensorId))
      .then((res: AxiosResponse) => {
        this.setState({ fixPinModal: res.data });
        if (res.data.success === true) {
          this.sensorsTable.current?.reloadData();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => this.setState({ loading: false }));
  };

  private tableBuilt = () => {
    $('.fix-pin-btn').on('click', this.fixPin);
    if (this.state.showModal) {
      // Find new row or close modal
      const { id } = this.state.selectedRow;
      const newRow = this.sensorsTable.current?.getData()?.find((x) => x.id === id);
      if (newRow !== undefined && newRow !== null) {
        this.setState({ selectedRow: newRow });
      } else {
        this.setState({ selectedRow: null, showModal: false });
      }
    }
  };

  moveNfts = (rowData: Record<string, unknown>) => {
    const check = window.confirm(this.props.t('CONFIRM_MOVE_NFTS'));
    if (check) {
      const algorandAccount = rowData.algo_account as string;
      // TODO: Check account != null ...
      this.setState({ loading: true });
      Axios.post(constants.api.moveNfts.replace('{account}', algorandAccount))
        .then((res: AxiosResponse) => {
          if (res.data.success === true) {
            this.sensorsTable.current?.reloadData();
          }
        })
        .catch((error) => {
          this.setState({ showError: true, errorMessage: error.message });
        })
        .finally(() => this.setState({ loading: false }));
    }
    return true;
  };

  deleteDeviceOwner = (sensorId: string) => {
    const check = window.confirm(this.props.t('CONFIRM_DEVICE_ORDER_DELETE'));
    if (check) {
      this.setState({ loading: true });
      Axios.post(constants.api.deleteDeviceOwner.replace('{deviceId}', sensorId))
        .then((res: AxiosResponse) => {
          // this.setState({ fixPinModal: res.data });
          if (res.data.success === true) {
            this.sensorsTable.current?.reloadData();
          }
        })
        .catch((error) => {
          this.setState({ showError: true, errorMessage: error.message });
        })
        .finally(() => this.setState({ loading: false }));
    }
  };

  changeMailSensor = (sensor_id: string) => {
    this.setState({ showChangeMail: true, isChangeMail: true, sensorId: sensor_id });
  };

  checkData = (sensor_id: string) => {
    this.setState({ loading: true });
    Axios.get(constants.api.checkData.replace('{deviceId}', sensor_id))
      .then((res: AxiosResponse) => {
        if (res.data.success === true) {
          this.setState({
            showCheckData: true,
            cdSensorId: res.data.data.sensorId,
            cdWrongData: res.data.data.wrongData,
            cdNoTransmissions: res.data.data.noTransmissions,
            cdData: res.data.data.date,
            cdDate: res.data.data.data
          });
        }
      })
      .catch((error) => {
        this.setState({ showError: true, errorMessage: error.message });
      })
      .finally(() => this.setState({ loading: false }));
  };

  banSensor = (rowData: Record<string, unknown>) => {
    const deviceId = rowData.sensor_id as string;
    const check = window.confirm(this.props.t('CONFIRM_DEVICE_BAN', { deviceId }));
    if (check) {
      this.setState({ loading: true });
      Axios.post(constants.api.banDevice.replace('{deviceId}', deviceId))
        .then((res: AxiosResponse) => {
          // this.setState({ fixPinModal: res.data });
          if (res.data.success === true) {
            this.sensorsTable.current?.reloadData();
          }
        })
        .catch((error) => {
          this.setState({ showError: true, errorMessage: error.message });
        })
        .finally(() => this.setState({ loading: false }));
    }
  };

  buttonAction = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  actionsButtons(cell: any) {
    // eslint-disable-next-line no-underscore-dangle
    const cellData = cell.getData();
    return ReactDOMServer.renderToString(<>
      <Button size="sm" className='action-btn-green' color='success' onClick={(event) => {
        this.buttonAction(event);
        this.moveNfts(cellData);
      }}>
        <ArrowsMove />
      </Button>

      <Button size="sm" className='action-btn-green' color='success' onClick={(event) => {
        this.buttonAction(event);
        this.changeMailSensor(cellData.sensor_id);
      }} >
        <Mailbox2 />
      </Button>

      <Button size="sm" className='action-btn-red' color='danger' onClick={(event) => {
        this.buttonAction(event);
        this.deleteDeviceOwner(cellData.id);
      }}>
        <Trash />
      </Button>

      <Button size="sm" className='action-btn-red' color='danger' onClick={(event) => {
        this.buttonAction(event);
        this.banSensor(cellData);
      }}>
        <XOctagon />
      </Button>
    </>);
  }

  formatBan = (cell: any) => {
    const data = cell.getData();
    return data?.is_banned ? this.props.t('YES') : this.props.t('NO');
  };

  formatIsAutofilled = (cell: any) => {
    const data = cell.getData();
    return data?.is_autofilled ? this.props.t('YES') : this.props.t('NO');
  };

  /* eslint-disable quote-props */
  private filterSelectOptions = { '1': this.props.t('YES'), '0': this.props.t('NO'), '': this.props.t('ALL') };
  /* eslint-enable i18next/no-literal-string */

  /* eslint-disable object-curly-newline */
  private columns = [
    { title: this.props.t('SENSOR_ID'), field: 'sensor_id', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('SENSOR_NAME'), field: 'sensor_name', headerSort: false, formatter: this.formatSensorName },
    { title: 'NFTassetID', width: 90, field: 'NFTassetID', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('DEVICE_NUMBER'), field: 'device_number', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('TYPE'), width: 90, field: 'type', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('MAIL'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('PIN'), field: 'pin', sorter: 'string', headerFilter: 'input' },
    {
      title: this.props.t('LAST_UPDATE'),
      field: 'last_update',
      sorter: 'string',
      headerFilter: 'input',
      formatter: this.formatLastUpd,
      tooltip: true
    },
    // { title: 'Activation date', field: 'activation_date', sorter: 'string', headerFilter: 'input', tooltip: true },
    // { title: 'Last Access', field: 'last_access', sorter: 'string', headerFilter: 'input', tooltip: true },
    {
      title: this.props.t('DATA_COLLECTED'),
      field: 'data_collected',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('GEO'),
      width: 90,
      field: 'geo',
      sorter: 'string',
      headerFilter: 'input'
    },
    // { title: 'NFT', field: 'NFTassetID', sorter: 'string', headerFilter: 'input' },
    {
      title: this.props.t('ALGORAND_ACCOUNT'),
      field: 'algo_account',
      sorter: 'string',
      headerFilter: 'input',
      tooltip: true
    },
    {
      title: this.props.t('ALGORAND_INFRASTRUCTURE_ACCOUNT'),
      field: 'algo_account_infra',
      sorter: 'string',
      headerFilter: 'input',
      tooltip: true
    },
    {
      title: this.props.t('CITY'),
      width: 90,
      field: 'city',
      sorter: 'string',
      headerFilter: 'input',
      tooltip: true,
      formatter: reactFormatter(<ViewIcon />)
    },
    {
      title: this.props.t('PROVINCE'),
      width: 90,
      field: 'province',
      sorter: 'string',
      headerFilter: 'input',
      tooltip: true,
      formatter: reactFormatter(<ViewIcon />)
    },
    {
      title: this.props.t('COUNTRY'),
      width: 90,
      field: 'country',
      sorter: 'string',
      headerFilter: 'input',
      tooltip: true,
      formatter: reactFormatter(<ViewIcon />)
    },
    {
      title: this.props.t('AUTOFILLED'),
      field: 'is_autofilled',
      sorter: 'string',
      headerFilter: 'select',
      visible: false,
      // eslint-disable-next-line i18next/no-literal-string
      editor: 'select',
      editorParams: this.filterSelectOptions,
      headerFilterParams: this.filterSelectOptions,
      width: 80,
      formatter: this.formatIsAutofilled
    },
    {
      title: this.props.t('KYC'),
      field: 'tier',
      sorter: 'string',
      width: 100,
      headerFilter: 'input'
    },
    { title: this.props.t('NOTE'), width: 60, headerSort: false, formatter: this.formatNote },
    {
      title: '',
      sortable: false,
      formatter: reactFormatter(<Actions props={{
        t: this.props.t,
        changeMailSensor: this.changeMailSensor,
        moveNfts: this.moveNfts,
        deleteDeviceOwner: this.deleteDeviceOwner,
        banSensor: this.banSensor,
        checkData: this.checkData,
        buttonAction: this.buttonAction
      }} />),
      headerSort: false,
      width: 240,
      widthShrink: 0
    }
  ];
  /* eslint-enable object-curly-newline */

  closeModal = () => this.setState({ showModal: false, showChangeMail: false, showCheckData: false, selectedRow: null });
  closeFixPinModal = () => this.setState({ fixPinModal: false });

  loadDetail(purchase: any) {
    (this.props as any).history.push({
      pathname: `/purchases/${purchase?.id}`
    });
  }

  handleSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity()) {
      if (validator.isEmail(this.state.newMail)) {
        this.setState({ validated: true, showModal: false, loading: true });
        const submitData: ChangeDeviceMailRequest = {
          mail: this.state.newMail,
          includeLicense: this.state.includeLicense
        };
        this.setState({ loading: true });
        Axios.post(constants.api.changeMailSensor.replace('{deviceId}', encodeURIComponent(String(this.state.sensorId))), submitData)
          .then((res: AxiosResponse) => {
            if (res.data.success === true) {
              this.setState({ newMail: '', showChangeMail: false });
              this.sensorsTable.current?.reloadData();
            }
          })
          .catch((error) => {
            this.setState({ showError: true, errorMessage: error.message, newMail: '' });
          })
          .finally(() => this.setState({ loading: false }));
      } else {
        this.setState({ showError: true, errorMessage: this.props.t('INVALID_MAIL') });
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
      case 'includeLicense': {
        this.setState({ includeLicense: e.target.checked });
        break;
      }
      default:
        break;
    }
  };

  private onRowSelected = (rowSelected: any) => {
    // eslint-disable-next-line no-underscore-dangle
    this.setState({ showModal: true, selectedRow: rowSelected._row.data });
  };

  render() {
    const row = this.state.selectedRow;
    let name: string | undefined;
    let location: string | undefined;
    let lat: number | undefined;
    let lng: number | undefined;
    const { newMail } = this.state;
    if (row) {
      name = this.sensorFriendlyName(row.type, row.device_number);

      if (row.last_data) {
        const data = JSON.parse(row.last_data);
        location = data.location;
        if (location !== undefined && location !== null && location.length > 0) {
          const array = location.split(',');
          if (array.length === 2) {
            lat = Number.parseFloat(array[0]);
            lng = Number.parseFloat(array[1]);
          }
        }
      }
    }

    return (
      <><Container fluid>
        <TableView
          ref={this.sensorsTable}
          api={constants.api.getSensors}
          columns={this.columns}
          id={'sensors-live-list'}
          tableProps={{
            paginationSizeSelector: [10, 100, true],
            renderComplete: this.tableBuilt
          }}
          onRowSelected={(rowSelected: any) => this.onRowSelected(rowSelected)} />
        <Modal show={this.state.showCheckData} backdrop={true} keyboard={true} size='xl' onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>{row?.sensor_id}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container>
              <Descriptions size="default" bordered>
                <Descriptions.Item span={10} label={<b>{this.props.t('SENSOR_ID')}:</b>}>{this.state.cdSensorId ?? '-'}</Descriptions.Item>
                <Descriptions.Item span={10} label={<b>{this.props.t('DATE')}:</b>}>{this.state.cdDate}</Descriptions.Item>
                <Descriptions.Item span={10} label={<b>{this.props.t('DATA')}:</b>}>{this.state.cdData}</Descriptions.Item>
                <Descriptions.Item span={10} label={<b>{this.props.t('WRONG_DATA')}:</b>}>
                  {this.state.cdWrongData.toString()}</Descriptions.Item>
                <Descriptions.Item span={10} label={<b>{this.props.t('NO_TRANSMISSIONS')}:</b>}>
                  {this.state.cdNoTransmissions.toString()}
                </Descriptions.Item>
              </Descriptions>
            </Container>
          </Modal.Body>
        </Modal>
        <Modal show={this.state.showModal} backdrop={true} keyboard={true} size='xl' onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>{row?.sensor_id}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container>
              <Descriptions size="small" bordered>
                <Descriptions.Item span={2} label={<b>{this.props.t('SENSOR_NAME')}:</b>}>{name ?? '-'}</Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('TYPE')}:</b>}>{row ? row.type : '-'}</Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('MAIL')}:</b>}>{row ? row.mail : '-'}</Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('PIN')}:</b>}>{row ? row.pin : '-'}
                  {row && row.pin !== undefined && row.pin !== null && row.pin.startsWith('0') && (
                    <Button className='fix-pin-btn' variant='link' onClick={() => this.fixSensorPin(row.id)}>
                      <Wrench height={20} />
                    </Button>
                  )}</Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('ACTIVATION_DATE')}:</b>}>
                  {row ? this.formatDate(row.activation_date) : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('LAST_UPDATE')}:</b>}>
                  {row ? this.formatDate(row.last_update) : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('LAST_ACCESS')}:</b>}>
                  {row ? this.formatDate(row.last_access) : '-'}</Descriptions.Item>
                <Descriptions.Item label={<b>{this.props.t('DATA_COLLECTED')}:</b>}>
                  {row ? row.data_collected : '-'}</Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('GEO')}:</b>}>{row ? row.geo : '-'}</Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('NFT')}:</b>}>
                  {row ? row.NFTassetID : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={<b>{this.props.t('ALGORAND_ACCOUNT')}:</b>}>
                  {row ? row.algo_account : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={3} label={<b>{this.props.t('ALGORAND_INFRASTRUCTURE_ACCOUNT')}:</b>}>
                  {row ? row.algo_account_infra : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('CITY')}:</b>}>
                  {row ? row.city : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('REGION')}:</b>}>
                  {row ? row.province : '-'}
                </Descriptions.Item>
                <Descriptions.Item span={2} label={<b>{this.props.t('COUNTRY')}:</b>}>
                  {row ? row.country : '-'}
                </Descriptions.Item>
              </Descriptions>
              <Button
                style={{ marginTop: 10, marginBottom: 10 }}
                onClick={() => this.setState({ openLastData: !this.state.openLastData })}>{this.props.t('LAST_DATA')}</Button>
              {this.state.openLastData && <div>
                <pre style={{ height: '250px', overflow: 'hidden', overflowY: 'scroll' }}>
                  {row ? JSON.stringify(JSON.parse(row.last_data), undefined, 2) : '-'}
                </pre>
              </div>}

              {lat && lng && (
                <div className='map'>
                  <GoogleMapReact
                    bootstrapURLKeys={{
                      key: 'AIzaSyBTtp6t0kxEJ2nENMW4U1llK_FYHNAvrgk'
                    }}
                    defaultCenter={{ lat, lng }}
                    defaultZoom={9}
                  >
                    <Marker lat={lat} lng={lng} name={name!} />
                  </GoogleMapReact>
                </div>
              )}
            </Container>
          </Modal.Body>
        </Modal>

        <Modal show={this.state.showChangeMail} backdrop={true} keyboard={true} size='xl' onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>{this.props.t('CHANGE_MAIL')}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container>
              <Row className='w-100 justify-content-center'>
                <Card className='col-md-7 p-0'>
                  <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
                    <Card.Header>{this.props.t('CHANGE_MAIL_SENSOR')}</Card.Header>
                    <Card.Body>
                      <Form.Group controlId='newMail'>
                        <Form.Label>{this.props.t('NEW_MAIL')}</Form.Label>
                        <Form.Control required={true} type='text' placeholder={this.props.t('NEW_MAIL')}
                          value={newMail} onChange={this.onChangeValue} />
                      </Form.Group>
                      <Form.Group className="mb-3" controlId="includeLicense">
                        <Form.Check type="checkbox" label={this.props.t('INCLUDE_LICENSE')} onChange={this.onChangeValue} />
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
        </Modal><Modal show={!!this.state.fixPinModal} backdrop={true} keyboard={true} size='xl' onHide={this.closeFixPinModal}>
          <Modal.Body>
            {this.state.fixPinModal.success && <>{this.props.t('CHANGE_PIN_SUCCESS')} {this.state.fixPinModal.data.newPin}</>}
            {!this.state.fixPinModal.success && <>{this.props.t('CHANGE_PIN_ERROR')}</>}
          </Modal.Body>
        </Modal><CustomAlert
          type={CustomAlertType.ERROR}
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })} />
        <Loader fullscreen={true}
          visible={this.state.loading} />
      </Container></>
    );
  }

}

export default withTranslation()(Sensors);