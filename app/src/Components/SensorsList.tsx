import React from 'react';
import Axios from 'axios';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Col, Form, Modal, Pagination, Row } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import constants from '../constants';
import './sensorsList.scss';

class SensorsList extends React.Component<WithTranslation, any> {

  state: {
    sensors: any[],
    pagedSensors: any[],
    history: any[],
    selected: string,
    showHistory: boolean,
    filters: {
      byName: string,
      from: number | null,
      to: number | null
    },
    tableOptions: {
      record4page: number,
      count: number,
      page: number
    }
  };

  labels: string[] = [];
  keys: string[] = [];

  constructor(props: WithTranslation) {
    super(props);
    /* eslint-disable i18next/no-literal-string */
    this.state = {
      sensors: [],
      pagedSensors: [],
      history: [],
      selected: '',
      showHistory: false,
      filters: {
        byName: '',
        from: null,
        to: null
      },
      tableOptions: { record4page: 20, count: 0, page: 0 }
    };

    this.labels = [
      this.props.t('AIRQINO'),
      this.props.t('LAST_DATA_SENT'),
      this.props.t('PM25'),
      this.props.t('NO2'),
      this.props.t('O3'),
      this.props.t('CO'),
      this.props.t('GPS')
    ];

    this.keys = ['name', 'last_data_send', 'pm25', 'no2', 'o3', 'co', 'gps'];
    /* eslint-enable i18next/no-literal-string */

    this.getSensors().then(() => { });
  }

  getSensors = async () => {
    try {
      const result = await Axios.get(`${constants.api.getSensorsFE}`);
      if (result.data && result.data.success) {
        let sensors: any[] = (result.data.data || []).map((d: any) => ({
          id: d.key,
          name: d.key,
          /* eslint-disable no-underscore-dangle */
          timestamp: d.date.hits.hits[0]._source.date,
          last_data_send: new Date(d.date.hits.hits[0]._source.date * 1000).toLocaleString()
          /* eslint-enable no-underscore-dangle */
        }));
        sensors = sensors.sort((a, b) => (this.sensorNumberFromName(a.id) || 0) - (this.sensorNumberFromName(b.id) || 0));

        this.state.sensors = sensors;
        this.updateDatatable(0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  getHistoryFromSensors = (sensors: any[]) => {
    const promises = [];
    for (let i = 0; i < sensors.length; i += 1) {
      const sensor = sensors[i];
      const promise = Axios.get(`${constants.api.getSensorFEHistory}/${sensor.id}`).then((res) => {
        if (res.data && res.data.success) {
          /* eslint-disable no-underscore-dangle */
          const currentData = res.data.data.find((d: any) => d._source.date === sensor.timestamp);
          if (currentData) {
            sensor.pm25 = parseInt(currentData._source.in.pm2_5);
            sensor.no2 = parseInt(currentData._source.in.no2);
            sensor.o3 = parseInt(currentData._source.in.o3);
            sensor.co = parseInt(currentData._source.in.co);
            sensor.gps = currentData._source.location;
          }

          sensor.history = res.data.data.map((d: any) => {
            const sensor1 = {
              id: d._source.device_id,
              name: d._source.device_id,
              timestamp: d._source.date,
              last_data_send: new Date(d._source.date * 1000).toLocaleString(),
              pm25: parseInt(d._source.in.pm2_5),
              no2: parseInt(d._source.in.no2),
              o3: parseInt(d._source.in.o3),
              co: parseInt(d._source.in.co),
              gps: d._source.location
            };
            return sensor1;
          });
          /* eslint-enable no-underscore-dangle */
          this.setState({});
        }
      });
      promises.push(promise);
    }
    return Promise.all(promises).then(() => {
      this.setState({ pagedSensors: sensors });
    });
  };

  getSensorsHistory = async (sensor_id: string) => {
    if (sensor_id) {
      const sensor = this.state.sensors.find((s: any) => s.id === sensor_id);
      if (sensor) {
        if (sensor.history) {
          this.state.history = sensor.history;
          this.setState({ history: sensor.history, showHistory: true, selected: sensor_id });
          return;
        }
        this.getHistoryFromSensors([sensor]).then(() => {
          this.state.history = sensor.history;
          this.setState({ history: sensor.history, showHistory: true, selected: sensor_id });
        });
      }
    }
  };

  searchByName = (name: string) => {
    this.state.filters.byName = name;
    this.updateDatatable(0);
  };

  searchByRange = (from: string, to: string) => {
    const fromNumber = this.sensorNumberFromName(from) || 0;
    const toNumber = this.sensorNumberFromName(to) || Number.MAX_SAFE_INTEGER;
    this.state.filters.from = fromNumber;
    this.state.filters.to = toNumber;
    this.updateDatatable(0);
  };

  updateDatatable(page: number) {
    // eslint-disable-next-line no-debugger
    // debugger;
    let { sensors } = this.state;

    if (this.state.filters.byName) {
      const sensor = sensors.find((s) => (s.name || '').toLowerCase() === (this.state.filters.byName || '').toLowerCase());
      sensors = sensor ? [sensor] : [];
    } else if (this.state.filters.from || this.state.filters.to) {
      sensors = sensors.filter((s) => {
        const number = this.sensorNumberFromName(s.name);
        if (number === null) {
          return false;
        }
        return number >= (this.state.filters.from as number) && number <= (this.state.filters.to as number);
      });
    }

    const startIndex = page * this.state.tableOptions.record4page;
    const endIndex = (page + 1) * this.state.tableOptions.record4page;
    this.state.tableOptions.count = sensors.length;
    this.state.tableOptions.page = page;
    this.state.pagedSensors = sensors.slice(startIndex, endIndex);
    this.getHistoryFromSensors(this.state.pagedSensors);
    this.setState({ ...this.state });
  }

  sensorNumberFromName = (name: string) => {
    const parts = (name || '').split('_');
    const number = parseInt(parts.length === 1 ? parts[0] : parts[1]);
    return Number.isNaN(number) ? null : number;
  };

  handleClose = () => this.setState({ showHistory: false });
  handleShow = () => this.setState({ showHistory: true });

  renderTable = (sensors: any[], onlyInfo: boolean = false) => {
    const keys = this.keys.filter((k: string) => {
      if (onlyInfo) return k !== 'name';
      return true;
    });

    const labels = this.labels.filter((k: string) => {
      if (onlyInfo) return k !== this.props.t('AIRQINO');
      return true;
    });

    const trs = [];
    for (let i = 0; i < sensors.length; i += 1) {
      const sensor = sensors[i];

      const tr = <>
        <tr id={`sensor-${sensor.id}`}>
          {
            keys.map((k) => (
              <td key={`col-params-${k}`}>
                {sensor[k] || <span className="na-data">{this.props.t('NO_PARAMETER_DATA')}</span>}
              </td>))
          }
          {
            !onlyInfo &&
            <td className="showHistory" onClick={() => this.getSensorsHistory(sensor.id)}>
              {this.props.t('VIEW')} <Search></Search>
            </td>
          }
        </tr>
      </>;
      trs.push(tr);
    }
    if (trs.length === 0) {
      const noResults = <tr>
        <td className="no-result" colSpan={this.keys.length + 1}>{this.props.t('NO_RESULTS')}</td>
      </tr>;
      trs.push(noResults);
    }
    return <table id="sensors-table">
      <thead>
        <tr>
          {labels.map((l) => (<th key={`col-header-${l}`}>{l}</th>))}
          {
            !onlyInfo &&
            <th>{this.props.t('ACTIONS')}</th>
          }
        </tr>
      </thead>
      <tbody>
        {trs}
      </tbody>
    </table>;
  };

  render() {
    const table = this.renderTable(this.state.pagedSensors);
    const pages = Math.ceil(this.state.tableOptions.count / this.state.tableOptions.record4page) - 1;

    return <>
      <div id="header-wrapper">
        <div id="sensor-info">
          {this.props.t('SENSOR_TYPE_I')}: <span>{this.props.t('AIRQINO')}</span>
        </div>
        <div id="sensors-search">
          <Row>
            <Col xs={5}>
              <div className="label">{this.props.t('SEARCH_SINGLE_SENSOR')}</div>
              <Form.Control
                type="text"
                size="sm"
                placeholder={this.props.t('AIRQ_00')}
                onChange={(event) => this.searchByName(event.target.value)}
              />
            </Col>
            <Col>
              <div className="label">{this.props.t('SEARCH_RANGE_SENSORS_FROM')}</div>
              <Form.Control
                id="from"
                type="text"
                size="sm"
                placeholder={this.props.t('AIRQ_00')}
                onChange={
                  (event) => this.searchByRange(
                    event.target.value,
                    document.querySelector<HTMLInputElement>('#to')?.value || ''
                  )
                }
              />
              <div className="label margin-left">{this.props.t('SEARCH_RANGE_SENSORS_TO')}</div>
              <Form.Control
                id="to"
                type="text"
                size="sm"
                placeholder={this.props.t('AIRQ_XX')}
                onChange={
                  (event) => this.searchByRange(
                    document.querySelector<HTMLInputElement>('#from')?.value || '',
                    event.target.value
                  )
                }
              />
            </Col>
          </Row>
        </div>
      </div>

      {table}

      <Pagination style={{ marginTop: '2em' }}>
        <Pagination.First onClick={() => this.updateDatatable(0)} />

        {
          this.state.tableOptions.page > 0 &&
          <>
            <Pagination.Prev onClick={() => this.updateDatatable(this.state.tableOptions.page - 1)} />

            {this.state.tableOptions.page > 1 && <Pagination.Ellipsis />}

            <Pagination.Item onClick={() => this.updateDatatable(this.state.tableOptions.page - 1)}>
              {this.state.tableOptions.page}
            </Pagination.Item>
          </>
        }
        <Pagination.Item
          active={true}
          onClick={() => this.updateDatatable(this.state.tableOptions.page)}
        >
          {this.state.tableOptions.page + 1}
        </Pagination.Item>
        {
          this.state.tableOptions.page < pages &&
          <Pagination.Item onClick={() => this.updateDatatable(this.state.tableOptions.page + 1)}>
            {this.state.tableOptions.page + 2}
          </Pagination.Item>
        }

        {this.state.tableOptions.page < pages - 1 &&
          <>
            <Pagination.Ellipsis />
            <Pagination.Next onClick={() => this.updateDatatable(this.state.tableOptions.page + 1)} />
          </>
        }

        <Pagination.Last
          onClick={
            () => this.updateDatatable(
              Math.ceil(this.state.tableOptions.count / this.state.tableOptions.record4page) - 1
            )
          }
        />
      </Pagination>

      <Modal show={this.state.showHistory} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{this.props.t('SENSOR_HISTORY')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderTable(this.state.history, true)}</Modal.Body>
      </Modal>
    </>;
  }

}

export default withTranslation()(SensorsList);