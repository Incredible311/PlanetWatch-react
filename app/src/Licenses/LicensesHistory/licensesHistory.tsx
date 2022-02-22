import moment from 'moment';
import React, { createRef } from 'react';
import { Container } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import Loader from '../../common-components/loader';
import TableView from '../../Components/tableView';
import { minMaxFilterEditor, minMaxFilterFunction } from '../../Components/tableViewEditors';
import constants from '../../constants';
import './licensesHistory.scss';

interface LicenseState {
  loading: boolean
}

// Aggiungere NFTAssetID in tabella e in alert
class LicensesHistory extends React.Component<WithTranslation, LicenseState> {

  private licensesTable = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /* eslint-disable i18next/no-literal-string */
  private columns = [
    {
      title: this.props.t('DATE'),
      field: 'date',
      sorter: 'date',
      //headerFilter: 'input',
      headerSortStartingDir: 'desc',
      headerFilter: minMaxFilterEditor, 
      headerFilterFunc: minMaxFilterFunction, 
      headerFilterLiveFilter:false,
      formatter: (cell: any) => {
        const locale = (window.navigator as any).userLanguage || window.navigator.language;
        return moment(cell.getValue()).locale(locale).format('DD/MM/YYYY HH:mm');
      }
    },
    {
      title: this.props.t('FROM'),
      field: 'from_mail',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('TO'),
      field: 'to_mail',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('LICENSE_TYPE'),
      field: 'license_type',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('PRICE'),
      field: 'price',
      sorter: 'string',
      headerFilter: 'input',
      formatter: (cell: any) => {
        const value = cell.getValue();
        return value ? value.toFixed(2) : '-';
      }
    }
  ];

  render() {
    return (
      <Container fluid>
        <Loader fullscreen={true} visible={this.state.loading} />
        <TableView id={'licences-history'} ref={this.licensesTable} api={constants.api.getLicensesHistory} columns={this.columns} />
      </Container>
    );
  }

}

export default withTranslation()(LicensesHistory);