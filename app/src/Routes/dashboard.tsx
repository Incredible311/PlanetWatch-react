import React from 'react';
import Axios, { AxiosResponse } from 'axios';
import { Button, Col, OverlayTrigger, Popover, Row } from 'react-bootstrap';
import { InfoCircle } from 'react-bootstrap-icons';
import { withTranslation, WithTranslation } from 'react-i18next';
import Loader from '../common-components/loader';
import TableView from '../Components/tableView';
import constants from '../constants';
import ChartHome from '../Components/ChartHome';

interface DashboardObject {
  type: string,
  total: number,
  timeNull: number,
  time120: number,
  time24: number,
  time1: number
}

interface DashboardState {
  loading: boolean,
  dashboard?: DashboardObject
  data?: DashboardObject[]
}

class Dashboard extends React.Component<WithTranslation, DashboardState> {

  constructor(props: WithTranslation) {
    super(props);
    this.state = { loading: true };
  }

  componentDidMount() {
    Axios.get(constants.api.getDashboard).then((res: AxiosResponse) => {
      if (res.data.success) {
        const dashboard = res.data.data.reduce((total: DashboardObject, currentValue: DashboardObject) => (
          {
            /* eslint-disable-next-line i18next/no-literal-string */
            type: 'Total',
            total: total.total + currentValue.total,
            timeNull: total.timeNull + currentValue.timeNull,
            time120: total.time120 + currentValue.time120,
            time24: total.time24 + currentValue.time24,
            time1: total.time1 + currentValue.time1
          }
        ));
        this.setState({ loading: false, dashboard, data: res.data.data });
      }
    });
  }

  /* eslint-disable i18next/no-literal-string */
  classForKey = (key: string) => {
    let className: string;
    if (key === 'timeNull') {
      className = 'bg-secondary';
    } else if (key === 'time120') {
      className = 'bg-danger';
    } else if (key === 'time24') {
      className = 'bg-warning';
    } else if (key === 'time1') {
      className = 'bg-info';
    } else {
      className = 'bg-success';
    }
    return className;
  };

  formatStatus = (cell: any) => {
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
    cell.getElement().classList.add(className);
    return cell.getValue();
  };

  formatAlgos = (cell: any) => {
    cell.getElement().classList.remove('bg-info', 'bg-warning', 'bg-danger', 'bg-secondary');
    const data = cell.getData();
    const algos = data.algorands / 1000000;
    const assets = data.assetsCount;
    const neededAlgos = assets * 0.1;
    let className = '';
    // Algorand require to have 0.1 algos for each assets....
    if (neededAlgos > algos) {
      className = 'bg-danger';
    } else if (neededAlgos + 2 > algos) {
      className = 'bg-warning';
    } else {
      className = 'bg-success';
    }
    cell.getElement().classList.add(className);
    return algos;
  };

  formatPlanets = (cell: any) => {
    cell.getElement().classList.remove('bg-info', 'bg-warning', 'bg-danger', 'bg-secondary');
    const data = cell.getData();
    const planets = data.planets / 1000000;
    if (data.name === 'Mining') {
      let className = '';
      if (planets < 1500) {
        className = 'bg-danger';
      } else if (planets < 2500) {
        className = 'bg-warning';
      } else {
        className = 'bg-success';
      }
      cell.getElement().classList.add(className);
    }
    return planets;
  };
  /* eslint-enable i18next/no-literal-string */

  showDetails = (props: any, key: string) => {
    const className = this.classForKey(key);
    return (
      <Popover id='popover-basic' {...props}>
        <Popover.Title as='h3' className='px-5'>{this.props.t('DETAIL_BY_TYPE')}</Popover.Title>
        <Popover.Content>
          {this.state.data!.map((x: any) => (
            <div key={key + x.type} className='progress-group'>
              <span className='progress-text'>{x.type}</span>
              <span className='float-right text-sm'><b>{x[key]}</b>/{(this.state.dashboard as any)[key]}</span>

              <div className='progress sm'>
                <div className={`progress-bar ${className}`}
                  style={{ width: `${(100 * (x[key] ?? 0)) / ((this.state.dashboard as any)[key] ?? 1)}%` }}>
                </div>
              </div>
            </div>
          ))}
        </Popover.Content>
      </Popover>
    );
  };

  private columnsAcountsDashboard = [
    { title: this.props.t('ACCOUNT'), field: 'name', headerSort: false },
    { title: this.props.t('ADDRESS'), field: 'address', headerSort: false, tooltip: true },
    { title: this.props.t('ALGORANDS'), field: 'algorands', headerSort: false, formatter: this.formatAlgos },
    { title: this.props.t('NFT'), field: 'assetsCount', headerSort: false },
    { title: this.props.t('PLANETS'), field: 'planets', headerSort: false, formatter: this.formatPlanets }
  ];

  showAccounts = () => (
    <Col md='5'>
      <div className='card card-dark'>
        <div className='card-header'>{this.props.t('PLANETWATCH_ACCOUNTS')}</div>
        <div className='card-body'>
          <TableView
            api={constants.api.getAccountsDashboard}
            apiPagination={false}
            hideSizeSelector={true}
            columns={this.columnsAcountsDashboard} />
        </div>
        {this.state.loading &&
          <div className='overlay'>
            <Loader visible={this.state.loading} />
          </div>}
      </div>
    </Col>
  );

  private columnsMySensors = [
    { title: this.props.t('SENSOR_ID'), field: 'sensor_id', headerSort: false, tooltip: true },
    { title: this.props.t('TYPE'), field: 'type', headerSort: false },
    { title: this.props.t('PIN'), field: 'pin', headerSort: false },
    { title: this.props.t('LAST_UPDATE'), field: 'last_update', headerSort: false, formatter: this.formatStatus }
  ];

  private tableRows = [
    { title: this.props.t('NEVER_TRANSMITTED'), key: 'timeNull' },
    { title: this.props.t('5_DAYS'), key: 'time120' },
    { title: this.props.t('1_DAY'), key: 'time24' },
    { title: this.props.t('1_HOUR'), key: 'time1' }
  ];

  render() {
    return (
      <>
        <Row>
          <Col md='6'>
            <div className='card card-dark'>
              <div className='card-header'>{this.props.t('NO_TRANSMISSION_SENSORS')}</div>
              <div className='card-body'>
                {this.tableRows.map((x: any) => (
                  <Row key={`key-${x.key}`}>
                    <Col xs={11}>
                      <div className='progress-group'>
                        <span className='progress-text'>{x.title}</span>
                        <span className='float-right text-sm'>
                          <b>{(this.state.dashboard as any)?.[x.key]}</b>/{this.state.dashboard?.total}
                        </span>

                        <div className='progress sm'>
                          <div className={`progress-bar ${this.classForKey(x.key)}`}
                            style={
                              { width: `${(100 * ((this.state.dashboard as any)?.[x.key] ?? 0)) / (this.state.dashboard?.total ?? 1)}%` }
                            }>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={1} className='align-self-center'>
                      <OverlayTrigger placement='right' overlay={(props: any) => this.showDetails(props, x.key)}>
                        <Button variant='link'><InfoCircle /></Button>
                      </OverlayTrigger>
                    </Col>
                  </Row>
                ))}
              </div>
              {this.state.loading &&
                <div className='overlay'>
                  <Loader visible={this.state.loading} />
                </div>}
            </div>
          </Col>
          {/* <Col md='5'>
          <div className='card card-dark'>
            <div className='card-header'>{this.props.t('MY_SENSORS')}</div>
            <div className='card-body'>
              <TableView
                api={constants.api.getMySensors}
                apiPagination={false}
                paginationSize={5}
                hideSizeSelector={true}
                columns={this.columnsMySensors} />
            </div>
            {this.state.loading &&
              <div className='overlay'>
                <Loader visible={this.state.loading} />
              </div>}
          </div>
        </Col> */}
          {this.showAccounts()}
        </Row>
        <ChartHome />
      </>
    );
  }

}

export default withTranslation()(Dashboard);