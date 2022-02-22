// eslint-disable-next-line import/no-named-default
import { AxiosResponse, default as Axios, default as http } from 'axios';
import moment from 'moment';
import React, { ChangeEvent, createRef } from 'react';
import { Button, Card, Container, Form, Modal, Row } from 'react-bootstrap';
import { Download, FileExcel, FileExcelFill, Mailbox, Search, Trash } from 'react-bootstrap-icons';
import 'react-calendar/dist/Calendar.css';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { withTranslation, WithTranslation } from 'react-i18next';
import { DateObject } from 'react-multi-date-picker';
import { withRouter } from 'react-router';
import { reactFormatter } from 'react-tabulator';
import validator from 'validator';
import Loader from '../common-components/loader';
import CustomAlert, { CustomAlertType } from '../Components/customAlert';
import TableView from '../Components/tableView';
import constants from '../constants';
import ChangeMailRequest from '../Model/changeMailRequest';
import OrderDetails, { IOrder } from './orderDetails';
import './purchases.scss';

interface IPurchasesState {
  loading: boolean,
  selectedPurchase?: IOrder,
  showCounts: boolean,
  showError: boolean,
  errorMessage?: string,
  export: {
    showModal: boolean,
    source: string,
    table: boolean,
    from: Date,
    to: Date,
    title: string,
    status: Number
  },
  counts: {
    total: number | string,
    sources: { [key: string]: number }
  },
  calendar: boolean,
  date?: Date | Date[] | null,
  calendarStart: DateObject,
  calendarEnd: DateObject,
  calendarInitial: DateObject[],
  downloadId: Number,
  showModal: boolean,
  orderId: Number,
  validated: boolean,
  newMail: string,
  pSource: string
}

function str2bytes(str: String) {
  const bytes = new Uint8Array(str.length);
  // eslint-disable-next-line operator-assignment
  for (let i = 0; i < str.length; i = i + 1) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
}

/* eslint-disable i18next/no-literal-string */
function Actions(context: any) {
  // eslint-disable-next-line no-underscore-dangle
  const cellData = context.cell._cell.row.data;
  return <>
    <Button onClick={() => {
      // eslint-disable-next-line no-underscore-dangle
      context.props.rowSelected({ _row: { data: cellData } });
    }} size='sm' style={{ marginRight: '1em', background: 'green' }} color='success'>
      <Search />
    </Button>
    <Button onClick={() => { context.props.changeMail(cellData.id); }} size='sm'
      style={{ marginRight: '1em', background: 'green' }} color='danger'>
      <Mailbox />
    </Button>
    <Button size='sm' style={{ marginRight: '1em' }} color='warning'>
      <Download onClick={() => {
        context.props.downloadInvoice(cellData.id);
      }} />
    </Button>
    <Button size='sm' style={{ background: 'red' }} color='danger'>
      <Trash onClick={() => {
        context.props.deleteOrder(cellData.id);
      }} />
    </Button>
  </>;
}

class Purchases extends React.Component<WithTranslation, IPurchasesState> {

  refresh: boolean = true;
  private purchaseTable = createRef<TableView>();
  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false,
      calendar: false,
      selectedPurchase: undefined,
      showCounts: false,
      export: {
        showModal: false,
        source: '',
        table: false,
        from: new Date(),
        to: new Date(),
        title: '',
        status: 0
      },
      counts: {
        total: '-',
        sources: {}
      },
      calendarInitial: [
        new DateObject().subtract(4, 'days'),
        new DateObject().add(4, 'days')
      ],
      downloadId: 0,
      showModal: false,
      orderId: 0,
      validated: false,
      newMail: '',
      showError: false,
      calendarStart: new DateObject(),
      calendarEnd: new DateObject(),
      pSource: ''
    };

    this.loadCounts().then(() => { });
  }

  rowSelected(row: any) {
    // eslint-disable-next-line no-underscore-dangle
    const rowData = row._row.data;
    this.loadDetail(rowData);
  }

  loadDetail(purchase: any) {
    (this.props as any).history.push({
      pathname: `/purchases/${purchase?.id}`
    });
  }

  loadCounts = async () => {
    const result = await http.get(`${constants.api.getPurchasesCounts}`);
    if (result.data && result.data.success && result.data.data) {
      this.setState({ counts: result.data.data });
    }
  };

  toggleCounts = () => {
    this.setState({ showCounts: !this.state.showCounts });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async changeMail(id: number) {
    this.setState({ showModal: true, orderId: id });

    return null;
  }

  getSensorsAndLicensesReport = () => {
    const { source, from, to } = this.state.export;
    const fromQuery = moment(from).toDate().toISOString();
    const sourceQuery = source ? `source=${encodeURIComponent(source)}` : '';
    const toQuery = moment(to).toDate().toISOString();
    const queries = `?${sourceQuery}&from=${fromQuery}&to=${toQuery}`;
    const url = `${constants.api.base}/stats/sensors-licenses-overview/xlsx${queries}`;
    http.get(url).then((res: any) => {
      if (res.data?.success) {
        // window.open(`data:${res.data.data.mime};base64,${res.data.data.base64}`, '_blank');
        const fromDate = from ? '-' + moment(from).format('YYYY-MM-DD') : '';
        const toDate = to ? '-' + moment(to).format('YYYY-MM-DD') : '';
        let sourceLabel = '';
        if (source) {
          if (source.indexOf('.us') > -1) {
            sourceLabel = '-US';
          } else if (source.indexOf('.io') > -1) {
            sourceLabel = '-EU';
          } else {
            sourceLabel = '-B2B';
          }
        }
        const a = document.createElement('a');
        a.href = `data:${res.data.data.mime};base64,${res.data.data.base64}`;
        a.download = `${res.data.data.filename}${sourceLabel}${fromDate}${toDate}`;
        a.click();
      }
    });
  };

  getOverviewOrders = () => {
    const { source, from, to, table, status } = this.state.export;
    const sourceQuery = source ? `source=${encodeURIComponent(source)}` : '';
    const fromQuery = status === 0 ? moment(from).toDate().getTime() : moment(from).toDate().toISOString();
    let toQuery: Date | number | string = moment(to).toDate();
    if (status === 0) {
      toQuery.setDate(toQuery.getDate() + 1);
    }

    toQuery.setHours(23, 59, 999);
    toQuery = status === 0 ? toQuery.getTime() : toQuery.toISOString();
    const offset = new Date().getTimezoneOffset() * -1;
    const prefix = table ? 'table-' : '';
    let url = '';

    if (status === 0) {
      url = `${constants.api.base}/orders/${prefix}export?${sourceQuery}&from=${fromQuery}&to=${toQuery}&offset=${offset}`;
      // window.open(url, '_blank');
      http.get(url).then((res: any) => {
        if (res.data?.success) {
          // window.open(`data:${res.data.data.mime};base64,${res.data.data.base64}`, '_blank');
          const a = document.createElement('a');
          a.href = `data:${res.data.data.mime};base64,${res.data.data.base64}`;
          a.download = `${prefix}${res.data.data.filename}`;
          a.click();
        }
      });
    } else {
      url = `${constants.api.base}/orders/invoices?from=${fromQuery}&to=${toQuery}&offset=${offset}&${sourceQuery}`;
      this.downloadAPI(url);
    }
  };

  getDownloadFunction = () => {
    const { title } = this.state.export;
    switch (title) {
      case this.props.t('DOWNLOAD_SENSORS_LICENSES_REPORT'):
        return this.getSensorsAndLicensesReport;
      default:
        return this.getOverviewOrders;
    }
  };

  downloadAPI = (url: string) => {
    this.setState({ loading: true });
    http.get(url).then((res: any) => {
      this.setState({ loading: false });
      if (res.status === 200) {
        const blob = new Blob([str2bytes(res.data)], { type: 'application/zip' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = '1.zip';
        a.click();
      }
    });
  };

  openExportModal(source: string = '', table: boolean = false,
    title: string = this.props.t('EXPORT_ORDERS_MODAL_TITLE'), status: Number = 0) {
    this.state.export.source = source;
    this.state.export.table = table;
    this.state.export.showModal = true;
    this.state.export.title = title;
    this.state.export.status = status;
    this.setState({});
  }

  handleModalClose = () => {
    this.state.export.showModal = false;
    this.state.export.source = '';
    this.setState({});
  };

  downloadInvoice = (id: number) => {
    const url = `${constants.api.base}/orders/${id}/invoice`;
    // window.open(url, '_blank');
    http.get(url).then((res: any) => {
      if (res.data?.success) {
        // window.open(`data:${res.data.data.mime};base64,${res.data.data.base64}`, '_blank');
        const a = document.createElement('a');
        a.href = `data:${res.data.data.mime};base64,${res.data.data.base64}`;
        a.download = res.data.data.filename;
        a.click();
      }
    });
  };

  onChangeDate = (date: Date | Date[] | null | undefined) => {
    this.setState({ date, calendar: false });
  };

  async deleteOrder(id: number) {
    const check = window.confirm(this.props.t('CONFIRM_ORDER_DELETE'));
    if (check) {
      // eslint-disable-next-line no-debugger
      const result = await http.delete(`${constants.api.deleteOrder}/${id}`);
      await this.loadCounts();
      this.refresh = false;
      this.setState({});
      this.refresh = true;
      this.setState({});
      return result;
    }
    // eslint-disable-next-line no-debugger
    return null;
  }

  proceedChangeDate(values: DateObject | DateObject[] | null) {
    const temp = values;
    if (Array.isArray(temp)) {
      if (temp.length > 1) {
        this.setState({ calendarStart: temp[0], calendarEnd: temp[1] });
      } else if (temp.length === 1) {
        this.setState({ calendarStart: temp[0], calendarEnd: temp[0] });
      }
    }
  }

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

  private columns = [
    { title: this.props.t('Order ID'), field: 'order_id', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('Source'), field: 'source', sorter: 'string', headerFilter: 'input' },
    {
      title: this.props.t('MAIL'),
      field: 'contact.mail',
      filterField: 'contacts.mail',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('Date'),
      field: 'date',
      sorter: 'date',
      headerFilter: 'input',
      formatter: (cell: any) => {
        const locale = (window.navigator as any).userLanguage || window.navigator.language;
        // eslint-disable-next-line no-underscore-dangle
        return moment(cell._cell.value).locale(locale).format('DD/MM/YYYY HH:mm');
      }
    },
    {
      title: this.props.t('ITEMS'),
      field: 'productsDescription',
      sorter: 'string',
      headerFilter: false,
      headerSort: false
    },
    {
      title: this.props.t('SKU'),
      field: 'productsSkus',
      sorter: 'string',
      headerFilter: false,
      headerSort: false
    },
    { title: this.props.t('TOTAL'), field: 'total', sorter: 'string', headerFilter: 'input' },
    {
      title: this.props.t('Currency'),
      field: 'paymentType.currency',
      sorter: 'string',
      filterField: 'payment_types.currency',
      headerFilter: 'input'
    },
    {
      title: this.props.t('PAYMENT_TYPE'),
      field: 'paymentType.friendly_name',
      sorter: 'string',
      filterField: 'payment_types.friendly_name',
      headerFilter: 'input'
    },
    {
      title: '',
      sortable: false,
      formatter: reactFormatter(<Actions props={{
        rowSelected: this.rowSelected.bind(this),
        changeMail: this.changeMail.bind(this),
        downloadInvoice: this.downloadInvoice.bind(this),
        deleteOrder: this.deleteOrder.bind(this)
      }} />),
      headerSort: false,
      width: '200'
    }
  ];

  handleSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity()) {
      if (validator.isEmail(this.state.newMail)) {
        this.setState({ validated: true, showModal: false, loading: true });
        const submitData: ChangeMailRequest = {
          mail: this.state.newMail
        };
        this.setState({ loading: true });
        Axios.post(constants.api.changeMailOrder.replace('{orderId}', String(this.state.orderId)), submitData)
          .then((res: AxiosResponse) => {
            if (res.data.success === true) {
              this.purchaseTable.current?.reloadData();
              this.setState({ newMail: '' });
            }
          })
          .catch((error) => {
            this.setState({ showError: true, errorMessage: error.message, newMail: '' });
          })
          .finally(() => this.setState({ loading: false }));
      } else {
        this.setState({ showError: true, errorMessage: 'Not validated Email' });
      }
    } else {
      this.setState({ validated: false });
    }
  };

  closeModal = () => this.setState({ showModal: false });

  render() {
    const counts = Object.keys(this.state.counts.sources);
    const { showModal, title } = this.state.export;
    const { newMail } = this.state;

    return (
      <>
        <Container fluid>
          <Card>
            <Card.Body>
              <b>
                {this.props.t('TOTAL').toUpperCase()}
              </b>
              : {this.state.counts.total}
              <div>
                <small onClick={() => this.openExportModal(undefined, false, this.props.t('DOWNLOAD_REPORT'))}
                  className='cursor'><FileExcelFill color='green' />
                  {this.props.t('DOWNLOAD_REPORT')}
                </small>
                <small style={{ marginLeft: '1em' }}
                  onClick={() => this.openExportModal(undefined, true, this.props.t('DOWNLOAD_TABLE'))}
                  className='cursor'><FileExcel color='green' />
                  {this.props.t('DOWNLOAD_TABLE')}
                </small>
                <small style={{ marginLeft: '1em' }}
                  onClick={() => this.openExportModal(undefined, true, this.props.t('DOWNLOAD_INVOICE'), 1)}
                  className='cursor'><FileExcel color='green' />
                  {this.props.t('DOWNLOAD_INVOICE')}
                </small>
                <small style={{ marginLeft: '1em' }}
                  onClick={() => this.openExportModal(undefined, true, this.props.t('DOWNLOAD_SENSORS_LICENSES_REPORT'), 1)}
                  className='cursor'><FileExcel color='green' />
                  {this.props.t('DOWNLOAD_SENSORS_LICENSES_REPORT')}
                </small>
              </div>
              {
                counts.length > 0 &&
                <>
                  <span
                    style={{ float: 'right', cursor: 'pointer', fontSize: '0.8em' }}
                    onClick={this.toggleCounts}
                  >
                    {this.props.t(this.state.showCounts ? 'HIDE_DETAILS' : 'SHOW_DETAILS')}
                  </span>
                  {
                    this.state.showCounts &&
                    <table style={{ fontSize: '0.8em' }}>
                      <tbody>
                        {counts.map((key: string) => <tr key={key}>
                          <th>
                            {key}:
                          </th>
                          <td>
                            {this.state.counts.sources[key]}
                          </td>
                          <td className='cursor' onClick={() => this.openExportModal(key, false, this.props.t('DOWNLOAD_REPORT'))}>
                            <FileExcelFill color='green' />
                            {this.props.t('DOWNLOAD_REPORT')}
                          </td>
                          <td className='cursor' onClick={() => this.openExportModal(key, true, this.props.t('DOWNLOAD_REPORT'))}>
                            <FileExcel color='green' />
                            {this.props.t('DOWNLOAD_TABLE')}
                          </td>
                          <td className='cursor' onClick={() => this.openExportModal(key, true, this.props.t('DONLOAD_INVOICE'), 1)}>
                            <FileExcel color='green' />
                            {this.props.t('DOWNLOAD_INVOICE')}
                          </td>
                          <td className='cursor' onClick={() => {
                            this.openExportModal(key, true, this.props.t('DOWNLOAD_SENSORS_LICENSES_REPORT'), 1);
                          }}>
                            <FileExcel color='green' />
                            {this.props.t('DOWNLOAD_SENSORS_LICENSES_REPORT')}
                          </td>
                        </tr>)}
                      </tbody>
                    </table>
                  }
                </>
              }
            </Card.Body>
          </Card>

          {this.refresh &&
            <TableView
              ref={this.purchaseTable}
              api={constants.api.getOrders}
              columns={this.columns}
              id={'purchases'}
              params={{ includes: ['billing', 'contact', 'payment_type', 'items'].join(',') }}
            />}
          <Modal show={this.state.selectedPurchase !== undefined} backdrop='static' keyboard={false} size='xl' centered={true}>
            <Modal.Body>
              <Container>
                {/* <AddPurchase data={this.state.selectedPurchase}></AddPurchase> */}
                {/* <AddReward data={undefined}></AddReward> */}
                <OrderDetails data={this.state.selectedPurchase} />
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='primary' onClick={() => this.setState({ selectedPurchase: undefined })}>
                {this.props.t('CLOSE')}
              </Button>
            </Modal.Footer>
          </Modal>
          <Loader fullscreen={true} visible={this.state.loading} />
        </Container>

        <Modal show={showModal} onHide={this.handleModalClose} backdrop='static' keyboard={false} size='xl'>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className='mb-3' controlId='formBasicPassword'>
              <Form.Label>{this.props.t('FROM')}</Form.Label>
              <Form.Control type='date' defaultValue={moment(this.state.export.from).format('YYYY-MM-DD')}
                onChange={(e: any) => {
                  this.state.export.from = e.target.valueAsDate;
                }} />
            </Form.Group>
            <Form.Group className='mb-3' controlId='formBasicPassword'>
              <Form.Label>{this.props.t('TO')}</Form.Label>
              <Form.Control type='date' defaultValue={moment(this.state.export.to).format('YYYY-MM-DD')}
                onChange={(e: any) => {
                  this.state.export.to = e.target.valueAsDate;
                }} />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant='secondary' onClick={this.handleModalClose}>{this.props.t('CANCEL')}</Button>
            <Button variant='primary' onClick={this.getDownloadFunction()}>{this.props.t('DOWNLOAD')}</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={this.state.showModal} backdrop={true} keyboard={true} size='xl' onHide={this.closeModal}>
          <Modal.Header>
            <Modal.Title>{this.props.t('CHANGE_MAIL')}</Modal.Title>
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
        <CustomAlert
          type={CustomAlertType.ERROR}
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </>
    );
  }

}

export default withTranslation()(withRouter(Purchases as any));