import React, { createRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { Button, Container } from 'react-bootstrap';
import { NodePlus } from 'react-bootstrap-icons';
import Axios, { AxiosResponse } from 'axios';
import { withTranslation, WithTranslation } from 'react-i18next';
import $ from 'jquery';

import Loader from '../common-components/loader';
import constants from '../constants';
import TableView from '../Components/tableView';
import { ReactComponent as AlgoLogo } from '../images/algorand_logo_mark_black.svg';

interface IKycState {
  loading: boolean
}

class Kyc extends React.Component<WithTranslation, IKycState> {

  private kycTable = createRef<TableView>();

  constructor(props: WithTranslation) {
    super(props);
    this.state = { loading: false };
  }

  private initAccount = (e: JQuery.ClickEvent) => {
    this.setState({ loading: true });
    const mail = e.currentTarget.id;
    e?.stopPropagation();
    Axios.get(constants.api.initKycAccount.replace('{email}', mail))
      .then((res: AxiosResponse) => {
        if (res.data.success === true) {
          this.kycTable.current?.reloadData();
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => this.setState({ loading: false }));
  };

  private addIcon = (cell: any) => {
    const { algos, mail } = cell.getRow().getData();
    let res;
    if (algos === undefined || algos === null) {
      res = '-';
    } else if (algos === 0) {
      res = ReactDOMServer.renderToString(<>
        {algos}
        <Button className='init-account-btn' id={mail} variant='link'>
          <AlgoLogo height={20} /><NodePlus />
        </Button>
      </>);
    } else {
      res = algos / 1000000;
    }
    return res;
  };

  private formatPlanets = (cell: any) => {
    const { planets } = cell.getRow().getData();
    if (planets === undefined || planets === null) {
      return '-';
    }
    return planets / 1000000;
  };

  private tableBuilt = () => {
    console.log('Built');
    $('.init-account-btn').on('click', this.initAccount);
  };

  private columns = [
    { title: this.props.t('MAIL'), field: 'mail', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('ALGORAND_ACCOUNT'), field: 'algo_account', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('ALGORAND_BALANCE'), headerSort: false, formatter: this.addIcon },
    { title: this.props.t('PLANET_BALANCE'), headerSort: false, headerFilter: false, formatter: this.formatPlanets },
    { title: this.props.t('ETHEREUM_ACCOUNT'), field: 'ethereum_account', sorter: 'string', headerFilter: 'input' },
    { title: this.props.t('COMPLETED'), field: 'synaps_completed', sorter: 'number', headerFilter: 'input' }
  ];

  render() {
    return (
      <Container fluid>
        <Loader fullscreen={true} visible={this.state.loading} />
        <TableView
          ref={this.kycTable}
          api={constants.api.getKycInfos}
          id={'kyc'}
          columns={this.columns}
          tableProps={{ renderComplete: this.tableBuilt }}
        />
      </Container>
    );
  }

}

export default withTranslation()(Kyc);