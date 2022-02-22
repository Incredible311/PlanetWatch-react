import { message } from 'antd';
import Axios, { AxiosResponse } from 'axios';
import React, { createRef } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Tooltip } from 'antd';
import { PersonDash, PersonPlus, XOctagon, ArrowRepeat } from 'react-bootstrap-icons';
import ReactDOMServer from 'react-dom/server';
import { withTranslation, WithTranslation } from 'react-i18next';
import { reactFormatter } from 'react-tabulator';
import Loader from '../common-components/loader';
import TableView from '../Components/tableView';
import constants from '../constants';
import ContactType from '../Model/contactType';

interface IContactsState {
  loading: boolean,
  contactType: ContactType,
  showModal: boolean,
  selectedRow?: any,
  details?: any,
  add: boolean
}

function ContactActions(context: any) {
  const cellData = context.cell.getData();
  return <>
    <Tooltip placement="top" title={context.props.t('BAN_CONTACT')}>
      <Button size="sm"
        className={cellData?.is_banned ? 'action-btn-red' : ''}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          context.props.banMail(cellData);
        }}>
        <XOctagon />
      </Button>
    </Tooltip>
    <Tooltip placement="top" title={context.props.t('VERIFY_KYC')}>
      <Button size="sm"
        style={{ marginLeft: 15, backgroundColor: '#228B22', borderColor: 'green' }}
        onClick={() => {
          console.log(cellData);
          Axios.post(constants.api.refreshKycOnboarding.replace('{id}', cellData.id))
            .then((res: AxiosResponse) => {
              if (res.data.success === true) {
                message.success({
                  content: context.props.t(res.data?.data?.message || 'KYC_UPDATED'),
                  style: {
                    marginTop: 100
                  }
                });
              }
              const tablePage = context.props?.tabulator?.current?.tabulator?.current?.table?.modules?.page;
              if (tablePage) {
                tablePage._getRemotePage();
              } else {
                console.log('NO PAGE FOUND');
              }
            })
            .catch((error) => {
              console.log(error);
              if (error.response?.data?.errorCode === 404) {
                const errorData = error.response?.data;
                message.error({
                  content: context.props.t(errorData?.errorMessage || 'KYC_NOT_UPDATED'),
                  style: {
                    marginTop: 100
                  }
                });
                return;
              }
              message.error({
                content: context.props.t('NOT_UPDATED'),
                style: {
                  marginTop: 100
                }
              });
            });
        }}>
        <ArrowRepeat />
      </Button>
    </Tooltip>

  </>;
}

class Contacts extends React.Component<WithTranslation, IContactsState> {

  private tabulator = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false, contactType: ContactType.PERSONAL, showModal: false, add: false
    };
  }

  toggleType = (checked: boolean) => {
    let type;
    if (checked) {
      type = ContactType.PERSONAL;
    } else {
      type = ContactType.BUSINESS;
    }
    this.setState({ contactType: type });
  };

  banMail = (rowData: Record<string, unknown>) => {
    const mail = rowData.mail as string;
    const check = window.confirm(this.props.t('CONFIRM_MAIL_BAN', { mail }));
    if (check) {
      this.setState({ loading: true });
      Axios.post(constants.api.banMail.replace('{mail}', mail))
        .then((res: AxiosResponse) => {
          if (res.data.success === true) {
            // TODO: Show success popup
            // this.table.current?.reloadData();
          }
        })
        .catch((error) => {
          // TODO: Show error popup
          console.log(error);
          // this.setState({ showError: true, errorMessage: error.message });
        })
        .finally(() => this.setState({ loading: false }));
    }
  };

  formatBan = (cell: any) => {
    const data = cell.getData();
    return data?.is_banned ? this.props.t('YES') : this.props.t('NO');
  };

  /* eslint-disable quote-props */
  private filterSelectOptions = { '1': this.props.t('YES'), '0': this.props.t('NO'), '': this.props.t('ALL') };
  /* eslint-enable i18next/no-literal-string */
  private columnsPersonal = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    {
      title: this.props.t('SURNAME'),
      width: 150,
      field: 'surname',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('NAME'),
      width: 150,
      field: 'name',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('MAIL'),
      width: 250,
      field: 'mail',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('BUSINESS_NAME'),
      field: 'business_name',
      sorter: 'string',
      width: 200,
      headerFilter: 'input'
    },
    {
      title: this.props.t('VAT'),
      field: 'vat',
      sorter: 'string',
      width: 100,
      headerFilter: 'input'
    },
    {
      title: this.props.t('KYC'),
      field: 'tier',
      sorter: 'string',
      width: 100,
      headerFilter: 'input'
    },
    {
      title: this.props.t('BAN'),
      field: 'is_banned',
      sorter: 'string',
      headerFilter: true,
      // eslint-disable-next-line i18next/no-literal-string
      editor: 'select',
      editorParams: this.filterSelectOptions,
      headerFilterParams: this.filterSelectOptions,
      width: 80,
      formatter: this.formatBan
    },
    {
      title: '',
      sortable: false,
      formatter: reactFormatter(<ContactActions props={{
        banMail: this.banMail,
        t: this.props.t,
        tabulator: this.tabulator
      }} />),
      headerSort: false,
      width: 100,
      widthShrink: 0
    }
  ];

  private columnsBusiness = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    { title: this.props.t('BUSINESS_NAME'), field: 'business_name', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('SURNAME'), field: 'referent_surname', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('NAME'), field: 'referent_name', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('MAIL'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('PHONE'), field: 'phone', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('ALGORAND_ACCOUNT'), field: 'algo_account', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('ALGORAND_INFRASTRUCTURE_ACCOUNT'), field: 'algo_infra_account', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('LINKED_CONTACTS'), field: 'linked_contacts', sorter: 'string', headerFilter: false }
  ];

  private deleteIcon = () => ReactDOMServer.renderToStaticMarkup(<PersonDash />);

  private removeLink = (_: Event, cell: any) => {
    const businessId = this.state.details?.id;
    const personalId = cell.getRow().getData().id;
    this.setState({ details: undefined },
      () => Axios.delete(constants.api.deleteBusinessContactLink.replace('{businessId}', businessId).replace('{personalId}', personalId))
        .then(() => {
          this.loadDetail(this.state.selectedRow);
          // TODO: refresh parent table! -> linked contacts count needs update!
        }));
  };

  private columnsDetails = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    { title: this.props.t('SURNAME'), field: 'surname', headerSort: false, headerFilter: false },
    { title: this.props.t('NAME'), field: 'name', headerSort: false, headerFilter: false },
    {
      width: 40,
      hozAlign: 'center',
      formatter: this.deleteIcon,
      cellClick: this.removeLink,
      headerSort: false
    }
  ];

  private addIcon = () => ReactDOMServer.renderToStaticMarkup(<PersonPlus />);

  private addLink = (e: Event, cell: any) => {
    const businessId = this.state.details?.id;
    const personalId = cell.getRow().getData().id;
    this.setState({ details: undefined },
      () => Axios.post(constants.api.addBusinessContactLink.replace('{businessId}', businessId).replace('{personalId}', personalId))
        .then(() => {
          this.loadDetail(this.state.selectedRow);
          // TODO: refresh parent table! -> linked contacts count needs update!
        }));
  };

  private columnsAdd = [
    { title: this.props.t('ID'), field: 'id', visible: false },
    { title: this.props.t('SURNAME'), field: 'surname', headerSort: false, headerFilter: false },
    { title: this.props.t('NAME'), field: 'name', headerSort: false, headerFilter: false },
    {
      formatter: this.addIcon,
      width: 40,
      hozAlign: 'center',
      cellClick: this.addLink,
      headerSort: false
    }
  ];

  rowSelected(row: any) {
    // eslint-disable-next-line no-underscore-dangle
    const rowData = row._row.data;
    this.setState({ showModal: true, selectedRow: rowData });
    this.loadDetail(rowData);
  }

  loadDetail(row: any) {
    Axios.get(constants.api.getBusinessContactDetail.replace('{id}', row.id)).then((response: AxiosResponse) => {
      console.log(response.data);
      this.setState({ details: response.data.data });
    });
  }

  tooltip = (cell: any) => {
    const rowData = cell.getData();
    return `${rowData.surname} ${rowData.name}\nMail: ${rowData.mail}\nPhone: ${rowData.phone}\nAlgorand account: ${rowData.algo_account}`;
  };

  render() {
    return (
      <Container fluid>
        <Loader visible={this.state.loading} />
        {this.state.contactType === ContactType.PERSONAL && (
        <TableView
            ref={this.tabulator} api={constants.api.getContacts} columns={this.columnsPersonal} id={'contacts-list'} />
        )
        }
      </Container>
    );
  }

}

export default withTranslation()(Contacts);