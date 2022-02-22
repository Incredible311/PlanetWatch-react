import React from 'react';
import Axios, { AxiosResponse } from 'axios';
import { Container } from 'react-bootstrap';
import { ArrowBarUp } from 'react-bootstrap-icons';
import ReactDOMServer from 'react-dom/server';
import { withTranslation, WithTranslation } from 'react-i18next';
import Loader from '../common-components/loader';
import TableView from '../Components/tableView';
import constants from '../constants';
import CustomAlert from '../Components/customAlert';

interface TempSensorsState {
  loading: boolean,
  showError: boolean,
  errorMessage?: string
}

// Aggiungere NFTAssetID in tabella e in alert
class TempSensors extends React.Component<WithTranslation, TempSensorsState> {

  constructor(props: WithTranslation) {
    super(props);
    this.state = { loading: false, showError: false };
  }

  private promote = (e: Event, cell: any) => {
    const sensor = cell.getRow().getData();
    // Check - To go live sensor must have sensorId - type - NFT - device_num - Algo account
    // Algo account must have initialized planets and nft!
    console.log(sensor);
    if (sensor.sensor_id && sensor.type && sensor.NFTassetID && sensor.device_number && sensor.algo_account) {
      this.setState({ loading: true });
      Axios.post(constants.api.promoteSensor.replace('{sensorId}', sensor.id))
        .then((res: AxiosResponse) => {
          this.setState({ loading: false });
          if (res.data.success) {
            cell.getRow().delete();
          } else {
            this.setState({ showError: true, errorMessage: res.data.errorMessage });
          }
        })
        .catch(() => this.setState({ showError: true, errorMessage: this.props.t('GENERIC_ERROR') }));
    } else {
      this.setState({ showError: true, errorMessage: this.props.t('MISSING_DATA_TO_GO_LIVE') });
    }
  };

  private arrow = () => ReactDOMServer.renderToStaticMarkup(<ArrowBarUp />);

  /* eslint-disable i18next/no-literal-string */
  private columns = [
    {
      title: this.props.t('SENSOR_ID'),
      field: 'sensor_id',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('TYPE'),
      field: 'type',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('ICCID'),
      field: 'iccid',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('ALGORAND_ACCOUNT'),
      field: 'algo_account',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('ALGORAND_INFRASTRUCTURE_ACCOUNT'),
      field: 'algo_account_infra',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('NFT'),
      field: 'NFTassetID',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      title: this.props.t('DEVICE_NUM'),
      field: 'device_number',
      sorter: 'string',
      headerFilter: 'input'
    },
    {
      formatter: this.arrow,
      width: 40,
      hozAlign: 'center',
      cellClick: this.promote,
      headerSort: false
    }
  ];

  render() {
    return (
      <Container fluid>
        <Loader fullscreen={true} visible={this.state.loading} />
        <TableView api={constants.api.getTempSensors} columns={this.columns} id={'sensors-temp-list'} />
        <CustomAlert
          show={this.state.showError}
          message={this.state.errorMessage}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </Container>
    );
  }

}

export default withTranslation()(TempSensors);