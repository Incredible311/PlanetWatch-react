import { message } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { RefObject } from 'react';
import { Container, Button, Modal, Spinner, Card, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Download, Search, ArrowRepeat, Wallet2 } from 'react-bootstrap-icons';
import { withTranslation, WithTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { reactFormatter } from 'react-tabulator';
import TableView from '../Components/tableView';
import constants from '../constants';
import DownloadTransactionForm from './DownloadTransactionForm';
import SyncTransactionForm from './SyncTransactionForm';
import './transactionsList.scss';
import { minMaxFilterEditor, minMaxFilterFunction } from '../Components/tableViewEditors';
import TrackTransactionForm from './TrackTransactionForm';
import TransactionForm from './transactionForm';

interface ITransactionListState {
  refresh: boolean,
  loading: boolean,
  showDetails: boolean,
  selectedTx: any,
  options: any,
  showAlert: boolean,
  showDownloadModal: boolean,
  showTrackModal: boolean,
  fromDate: string,
  toDate: string,
  address: string,
  showSyncModal: boolean,
  filters: { fromDate?: string, toDate?: string },
  totalTransactions: number,
  emptiesTransactions: number
}

/* eslint-disable i18next/no-literal-string */
function Actions(context: any) {
  // eslint-disable-next-line no-underscore-dangle
  const cellData = context.cell._cell.row.data;
  return <>
    <Button size='sm' style={{ marginRight: '1em', background: 'green' }} color='success'>
      <Search onClick={() => {
        // eslint-disable-next-line no-underscore-dangle
        context.props.rowSelected({ _row: { data: cellData } });
      }} />
    </Button>
  </>;
}

class TransactionList extends React.Component<WithTranslation, ITransactionListState> {

  private refTable: RefObject<TableView>;

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      refresh: true,
      loading: false,
      showDetails: false,
      selectedTx: undefined,
      options: [],
      showAlert: false,
      showDownloadModal: false,
      showTrackModal: false,
      fromDate: '',
      toDate: '',
      filters: {},
      address: constants.transaction.address,
      showSyncModal: false,
      totalTransactions: 0,
      emptiesTransactions: 0
    };

    this.refTable = React.createRef<TableView>();
  }

  componentDidMount = () => {
    this.getOverviewTransactions();
  };

  getOverviewTransactions = () => {
    return axios.get(constants.api.totalTransactions).then((res) => {
      this.setState({ totalTransactions: res.data.data?.total || '-', emptiesTransactions: res.data.data?.empties || '-' });
    });
  };

  rowSelected = (row: any) => {
    // eslint-disable-next-line no-underscore-dangle
    const rowData = row._row.data;
    this.setState({ selectedTx: rowData, showDetails: true });
    // (this.props as any).history.push({
    //     pathname: `/transactions/${rowData?.tx_id}`
    // });
  };

  parseBase64 = (cell: any) => {
    const value = cell.getValue();
    if (value) {
      return atob(value);
    }
    return '';
  };

  copyTxId = (txId: any) => {
    navigator.clipboard.writeText(txId).then(() => {
      message.success({
        content: this.props.t('TXID_COPIED'),
        style: {
          marginTop: 60
        }
      });
    });
  };

  parseCurrency = (cell: any) => {
    const decimals = cell.getRow().getData().unit_decimals;
    const value = cell.getValue();
    if (value) {
      return value / (10 ** decimals);
    }
    return 0;
  };

  private columns = [
    {
      title: this.props.t('Date'),
      field: 'date',
      sorter: 'date',
      //headerFilter: 'input',
      headerSortStartingDir: 'desc',
      headerFilter: minMaxFilterEditor,
      headerFilterFunc: minMaxFilterFunction,
      headerFilterLiveFilter: false,
      formatter: (cell: any) => {
        const locale = (window.navigator as any).userLanguage || window.navigator.language;
        return moment(cell.getValue()).locale(locale).format('DD/MM/YYYY HH:mm');
      }
    },
    {
      title: this.props.t('TX ID'), field: 'tx_id', sorter: 'string', headerFilter: 'input', cellClick: (e: Event, cell: any) => {
        // alert('cell clicked - ' + cell.getValue());
        this.copyTxId(cell.getValue());
      }
    },
    { title: this.props.t('ORDER_ID'), field: 'internal_order_id', sorter: 'string', headerFilter: 'input' },
    {
      title: this.props.t('AMOUNT'),
      field: 'amount',
      sorter: 'string',
      headerFilter: 'input',
      formatter: this.parseCurrency
    },
    {
      title: this.props.t('CURRENCY'),
      field: 'unit_name',
      sorter: 'string',
      headerFilter: 'input'
    },
    { title: this.props.t('ORDER_NOTE'), field: 'order_note', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('FROM'), field: 'from', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('TO'), field: 'to', sorter: 'string', headerFilter: 'input' },
    // {
    //     title: this.props.t('FEE'),
    //     field: 'fee',
    //     sorter: 'string',
    //     headerFilter: 'input',
    //     formatter: this.parseCurrency
    // },
    // { title: this.props.t('TYPE'), field: 'type', sorter: 'string', headerFilter: 'input' },
    {
      title: this.props.t('TX_NOTE'),
      field: 'tx_note',
      sorter: 'string',
      headerFilter: 'input',
      formatter: this.parseBase64
    },
    {
      title: '',
      sortable: false,
      formatter: reactFormatter(<Actions props={{ rowSelected: this.rowSelected.bind(this) }} />),
      headerSort: false
    }
  ];

  saveTransaction = async (tx: any) => {
    await axios.put(constants.api.updateTransaction, tx);
    await this.getOverviewTransactions();
    this.setState({ showDetails: false, showAlert: true, refresh: false });
    this.setState({ refresh: true });
  };

  downlaodTrackedTransactionsModal = () => {
    this.setState({ showDownloadModal: !this.state.showDownloadModal });
  };

  trackPaymentsModal = () => {
    this.setState({ showTrackModal: !this.state.showTrackModal });
  };

  syncTransactionsModal = () => {
    this.setState({ showSyncModal: !this.state.showSyncModal });
  };

  changeFromDate = (date: string) => {
    this.setState({ fromDate: date });
  };

  changeToDate = (date: string) => {
    this.setState({ toDate: date });
  };

  changeAddress = (address: string) => {
    this.setState({ address });
  };

  trackTransaction = () => {
    this.setState({ loading: true });
    axios.post(constants.api.trackTransaction, {
      from: this.state.fromDate,
      to: this.state.toDate,
      address: this.state.address
    })
      .then(async (res) => {
        this.setState({ showTrackModal: !this.state.showTrackModal });
        if (res.data.success) {
          this.setState({ loading: false });
          message.success({
            content: `${res.data.data.txs_added} ${this.props.t('TRANSACTIONS_UPDATE')}`,
            duration: 2,
            style: {
              marginTop: 50,
              width: 'auto'
            }
          });
          this.refTable.current?.reloadData();
          await this.getOverviewTransactions();
        }
      })
      .catch((reason: any) => {
        console.log(reason);
      });
  };

  downloadTransaction = () => {
    axios.post(constants.api.exportTransaction, {
      from: this.state.fromDate,
      to: this.state.toDate
    }).then((res: any) => {
      if (res.data?.success) {
        // window.open(`data:${res.data.data.mime};base64,${res.data.data.base64}`, '_blank');
        const a = document.createElement('a');
        a.href = `data:${res.data.data.mime};base64,${res.data.data.base64}`;
        a.download = `${res.data.data.filename}`;
        a.click();
      }
    });
  };

  // syncTransactions(mapper: { [key: string]: number | undefined }) {

  // }

  clearFilters = () => {
    this.setState({ filters: {} });
  };

  render() {
    return (
      <>
        <Card id='txs-filters' style={{ marginLeft: '0.5em', marginRight: '0.5em' }}>
          <Card.Body>
            <Row>
              <Col>
                <div>
                  <b>{this.props.t('TOTAL').toUpperCase()}</b>: {this.state.totalTransactions}
                  <br></br>
                  <b>{this.props.t('NO_ASSOCIATE').toUpperCase()}</b>: {this.state.emptiesTransactions}
                </div>
              </Col>
              <Col>
                <div className='text-right'>
                  <OverlayTrigger
                    placement={'bottom'}
                    overlay={
                      <Tooltip id={'tooltip'}>
                        {this.props.t('DOWNLOAD_TRANSACTION')}
                      </Tooltip>
                    }
                  >
                    <Button className="botton-hover" variant='primary' onClick={this.downlaodTrackedTransactionsModal}>
                      <Download />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement={'bottom'}
                    overlay={
                      <Tooltip id={'tooltip'}>
                        {this.props.t('TRACK_PAYMENT')}
                      </Tooltip>
                    }
                  >
                    <Button className="botton-hover" variant='primary' style={{ marginLeft: 20 }} onClick={this.trackPaymentsModal}>
                      <Wallet2 />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement={'bottom'}
                    overlay={
                      <Tooltip id={'tooltip'}>
                        {this.props.t('SYNCHRONIZE_TRANSACATIONS')}
                      </Tooltip>
                    }
                  >
                    <Button className="botton-hover" variant='primary' style={{ marginLeft: 20 }} onClick={this.syncTransactionsModal}>
                      <ArrowRepeat />
                    </Button>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>


        <Container fluid>
          {
            this.state.refresh &&
            <TableView
              ref={this.refTable}
              api={constants.api.getTransactions}
              columns={this.columns}
              id={'transactions'}
              initialSorting={[{ column: 'date', dir: 'desc' }]}
            />
          }

          <Modal
            show={this.state.showDetails}
            onHide={() => this.setState({ showDetails: false })}
            backdrop='static'
            keyboard={false} size='xl'
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.props.t('EXPORT_ORDERS_MODAL_TITLE')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <TransactionForm
                tx={this.state.selectedTx}
                t={this.props.t}
                isLoading={false}
                options={this.state.options}
                onValueChange={(tx: any) => this.setState({ selectedTx: tx })}
              />
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => this.setState({ showDetails: false })}
              >
                {this.props.t('CANCEL')}
              </Button>
              <Button variant='primary' onClick={() => this.saveTransaction(this.state.selectedTx)}>
                {this.props.t('SAVE')}
              </Button>
            </Modal.Footer>
          </Modal>
          {this.state.loading && <div className='fullscreen backdrop'>
            <Spinner animation='border' role='status' variant={'light'}>
              <span className='sr-only'>{this.props.t('LOADING')}...</span>
            </Spinner>
          </div>}
          <Modal
            show={this.state.showDownloadModal}
            onHide={() => this.setState({ showDownloadModal: false })}
            keyboard={false} size='xl'
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.props.t('DOWNLOAD_TRANSACTION')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <DownloadTransactionForm
                t={this.props.t}
                changeFromDate={(date: string) => this.changeFromDate(date)}
                changeToDate={(date: string) => this.changeToDate(date)}
                fromDate={this.state.fromDate}
                toDate={this.state.toDate} />
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => this.setState({ showDownloadModal: false })}
              >
                {this.props.t('CANCEL')}
              </Button>
              <Button variant='primary' onClick={() => this.downloadTransaction()}>
                {this.props.t('SAVE')}
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={this.state.showTrackModal}
            onHide={() => this.setState({ showTrackModal: false })}
            keyboard={false} size='xl'
          >
            <Modal.Header closeButton>
              <Modal.Title>{this.props.t('TRACK_PAYMENT')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <TrackTransactionForm
                t={this.props.t}
                changeFromDate={(date: string) => this.changeFromDate(date)}
                changeToDate={(date: string) => this.changeToDate(date)}
                changeAddress={(address: string) => this.changeAddress(address)}
                fromDate={this.state.fromDate}
                toDate={this.state.toDate}
                address={this.state.address} />
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => this.setState({ showTrackModal: false })}
              >
                {this.props.t('CANCEL')}
              </Button>
              <Button variant='primary'
                onClick={() => {
                  this.setState({ loading: true });
                  this.trackTransaction();
                }
                }>
                {this.props.t('SAVE')}
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal
            show={this.state.showSyncModal}
            onHide={() => this.setState({ showSyncModal: false })}
            keyboard={false} size='xl'
          >
            <SyncTransactionForm
              t={this.props.t}
              refreshPage={() => this.setState({ refresh: true })}
              showSyncModal={this.state.showSyncModal}
              onComplete={async () => {
                this.setState({ showSyncModal: false });
                await this.getOverviewTransactions();
              }} />
          </Modal>
        </Container>
      </>
    );
  }

}

export default withTranslation()(withRouter(TransactionList as any));