import React, { ChangeEvent } from 'react';
import { Button, ButtonGroup, Card, Container, Dropdown, Form, Row } from 'react-bootstrap';
import Axios, { AxiosError, AxiosResponse } from 'axios';
import { withTranslation, WithTranslation } from 'react-i18next';
import util from 'util';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import Loader from '../../common-components/loader';
import constants from '../../constants';
import CustomAlert, { CustomAlertType } from '../../Components/customAlert';
import CalibrationParam from '../../Model/calibrationParam';
import SensorType from '../../Model/sensorType';
import AddSensorRequest from '../../Model/addSensorRequest';

const CALIBRATION_PREFIX = 'calibration-';

interface IAddSensorsState {
  calibrationParams?: Record<string, unknown>;
  type?: SensorType;
  validated: boolean;
  loading: boolean;
  loadingAccounts: boolean;
  accounts?: any[];
  showError: boolean;
  errorMessage?: string;
  errorType: CustomAlertType;
  ownerAccount?: string;
  ownerMail?: string;
  infrastructureAccount?: string;
  infrastructureMail?: string;
  sensorId?: string;
  location?: string;
  iccid?: string;
  infrastructurePercentage?: number;
}

// TODO: Modifica - cancellazioni contatti
// TODO: associare indirizzo agli utenti (via, città, piano)
// TODO: se si seleziona associazione su infrastruttura bisogna selezionare persona dell'associazione, chiamare il parametro location
// TODO: upload file del contratto - non per v1 :)
class AddSensors extends React.Component<WithTranslation, IAddSensorsState> {

  sensors_types: any[] = [];
  calibrations: { [key: string]: any } = {};

  constructor(props: WithTranslation) {
    super(props);
    this.state = {
      validated: false,
      loading: false,
      loadingAccounts: false,
      showError: false,
      errorType: CustomAlertType.ALERT
    };
  }

  componentDidMount() {
    this.setState({ loadingAccounts: true });
    Axios.get(constants.api.getAlgorandAccounts).then((res: AxiosResponse) => {
      const accounts = res.data.data.map((x: any) => {
        let name = x.mail;
        name += x.account ? ` - ${x.account}` : '';
        return {
          label: `${x.mail} - ${x.account}`,
          name,
          mail: x.mail,
          value: x.id,
          contact_id: x.contact_id,
          account: x.account
        };
      });
      this.setState({ accounts, loadingAccounts: false });
    }).catch((reason: AxiosError) => {
      this.setState({ loading: false, showError: true, errorMessage: reason.message, errorType: CustomAlertType.ALERT });
    });

    Axios.get(constants.api.getProductTypes).then((res: AxiosResponse) => {
      this.sensors_types = (res.data?.data || []).filter((d: any) => d.code && !d.code.startsWith('LL_'));
      Object.keys(constants.sensors_type).map((key: string) => {
        const sensorType = (constants.sensors_type as any)[key];
        const code: string = sensorType.value;
        this.calibrations[code] = sensorType.calibration_params;
        return key;
      });
      console.log(this.calibrations);
      this.setState({});
    }).catch((reason: AxiosError) => {
      this.setState({ loading: false, showError: true, errorMessage: reason.message, errorType: CustomAlertType.ALERT });
    });
  }

  loadDefaultCalibrationParam = (param: CalibrationParam): unknown => {
    switch (param.type) {
      case 'string':
      case 'number': {
        return param.default;
      }
      case 'object': {
        const obj: Record<string, unknown> = {};
        param.children?.forEach((paramChild) => {
          obj[paramChild.name] = this.loadDefaultCalibrationParam(paramChild);
        });
        return obj;
      }
      default: {
        break;
      }
    }
    return undefined;
  };

  loadDefaultCalibrationParams = (type: SensorType): Record<string, unknown> => {
    console.log('loadDefaultCalibrationParams');
    const params: Record<string, unknown> = {};
    const defaultParams = type.calibration_params;
    console.log(type.calibration_params);
    defaultParams?.forEach((x) => {
      params[x.name] = this.loadDefaultCalibrationParam(x);
      console.log(x);
    });
    console.log(params);
    console.log('loadDefaultCalibrationParams end');
    return params;
  };

  typeSelected = (eventKey: any): void => {
    const type = (constants.sensors_type as any)[eventKey] as SensorType;
    if (type.calibration_params && type.calibration_params.length > 0) {
      this.setState({ type, calibrationParams: this.loadDefaultCalibrationParams(type) });
    } else {
      this.setState({ type, calibrationParams: undefined });
    }
  };

  algoAccountChanged = (event: ChangeEvent<HTMLInputElement>): void => {
    const ownerAccount = event.target.value;
    const ownerMail = this.state.accounts?.find((a: any) => a.account === ownerAccount)?.mail;
    if (ownerMail !== undefined) {
      this.setState({ ownerAccount, ownerMail });
    } else {
      this.setState({ ownerAccount });
    }
  };

  algoAccountSelected = (eventKey: any): void => {
    const ownerAccount = eventKey;
    const ownerMail = this.state.accounts?.find((a: any) => a.account === ownerAccount)?.mail;
    this.setState({ ownerAccount, ownerMail });
  };

  algoInfraAccountChanged = (event: ChangeEvent<HTMLInputElement>): void => {
    const infrastructureAccount = event.target.value;
    const infrastructureMail = this.state.accounts?.find((a: any) => a.account === infrastructureAccount)?.mail;
    if (infrastructureMail !== undefined) {
      this.setState({ infrastructureAccount, infrastructureMail });
    } else {
      this.setState({ infrastructureAccount });
    }
  };

  algoInfraAccountSelected = (eventKey: any): void => {
    const infrastructureAccount = eventKey;
    const infrastructureMail = this.state.accounts?.find((a: any) => a.account === infrastructureAccount)?.mail;
    this.setState({ infrastructureAccount, infrastructureMail });
  };

  calibrationParam = (element: CalibrationParam, parentPrefix?: string) => {
    let component = null;
    switch (element.type) {
      case 'string': {
        component = <Form.Control required type='text'
          placeholder={this.props.t(element.name.toLocaleUpperCase())}
          defaultValue={element.default}
          onChange={this.onChangeValue} />;
        break;
      }
      case 'number': {
        // eslint-disable-next-line i18next/no-literal-string
        component = <Form.Control required className='hide-stepper' type='number' step='any'
          placeholder={this.props.t(element.name.toLocaleUpperCase())}
          defaultValue={element.default}
          onChange={this.onChangeValue} />;
        break;
      }
      case 'object': {
        component = <div className='calibration-param-group' key={element.name}>
          {this.calibrationChildrensParams(element.children, `${parentPrefix ?? ''}${element.name}-`)}
        </div>;
        break;
      }
      default: {
        break;
      }
    }
    return component;
  };

  calibrationChildrensParams = (params?: CalibrationParam[], parentPrefix?: string) => {
    if (params && Array.isArray(params)) {
      return params.map((element: CalibrationParam) => (
        <Form.Group key={element.name} controlId={`${CALIBRATION_PREFIX}${parentPrefix ?? ''}${element.name}`}>
          <Form.Label>{this.props.t(element.name.toLocaleUpperCase())}</Form.Label>
          {this.calibrationParam(element)}
        </Form.Group>
      ));
    }
    return null;
  };

  calibrationParams = () => {
    if (this.state.type?.calibration_params && Array.isArray(this.state.type?.calibration_params) &&
      this.state.type === constants.sensors_type.airqino) {
      return (
        <Form.Group>
          <Form.Label>{this.props.t('CALIBRATION_PARAMS')}</Form.Label>
          <div className='calibration-param-group'>
            {this.calibrationChildrensParams(this.state.type?.calibration_params)}
          </div>
        </Form.Group>
      );
    }
    return null;
  };

  onChangeCalibrationParam(field: string, value: string) {
    const nameComponents = field.split('-');
    const componentName = nameComponents[0];
    console.log(`Change value: ${field} -> ${componentName}`);
    const param = this.state.type?.calibration_params?.find((x) => x.name === componentName);
    console.log(`Param: ${util.inspect(param)}`);
    switch (param?.type) {
      case 'string': {
        this.state.calibrationParams![param!.name] = value;
        break;
      }
      case 'number': {
        const num = Number.parseFloat(value);
        if (!Number.isNaN(+value) && !Number.isNaN(num)) {
          this.state.calibrationParams![param!.name] = num;
        } else {
          console.error(`Change calibration param value not correct number! ${field} -> ${value}`);
        }
        break;
      }
      case 'object': {
        // TODO: Recursive...
        break;
      }
      default:
        console.error(`Change calibration param value not handled: ${field}`);
    }
    const num = Number.parseFloat(value);
    if (!Number.isNaN(num)) {
      // data.latitude = num;
    }
  }

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;

    switch (field) {
      case 'sensorId': {
        this.setState({ sensorId: value });
        break;
      }
      case 'ownerMail': {
        this.setState({ ownerMail: value });
        break;
      }
      case 'infrastructureMail': {
        this.setState({ infrastructureMail: value });
        break;
      }
      case 'infrastructurePercentage':
        this.setState({ infrastructurePercentage: parseInt(value) });
        break;
      case 'location': {
        this.setState({ location: value });
        break;
      }
      case 'iccid': {
        this.setState({ iccid: value });
        break;
      }
      default: {
        if (field.startsWith(CALIBRATION_PREFIX)) {
          const name = field.substr(CALIBRATION_PREFIX.length);
          this.onChangeCalibrationParam(name, value);
        } else {
          console.log(`Change value not handled: ${field}`);
        }
      }
    }
  };

  handleSubmit = (event: any) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity()) {
      const submitData: AddSensorRequest = {
        sensorId: this.state.sensorId!,
        type: this.state.type!.value,
        ownerAccount: this.state.ownerAccount!,
        ownerMail: this.state.ownerMail!,
        infrastructureAccount: this.state.infrastructureAccount,
        infrastructureMail: this.state.infrastructureMail,
        iccid: this.state.iccid,
        infrastructure_percentage: this.state.infrastructurePercentage
      };
      if (this.state.calibrationParams) {
        submitData.calibrationParams = JSON.stringify(this.state.calibrationParams!);
      }
      this.setState({ loading: true });
      Axios.post(constants.api.addSensors, submitData).then((res: AxiosResponse) => {
        this.setState({ loading: false });
        if (res.data.success) {
          this.setState({ showError: true, errorMessage: `Sensore aggiunto, id: ${res.data.data.id}`, errorType: CustomAlertType.INFO });
          form.reset();
        } else {
          this.setState({ showError: true, errorMessage: JSON.stringify(res.data), errorType: CustomAlertType.ALERT });
        }
      }).catch((reason: AxiosError) => {
        this.setState({ loading: false, showError: true, errorMessage: reason.message, errorType: CustomAlertType.ALERT });
      });
    }

    this.setState({ validated: true });
  };

  render() {
    /* eslint-disable i18next/no-literal-string */
    const { ownerAccount, ownerMail, infrastructureAccount, infrastructureMail, type, infrastructurePercentage } = this.state;
    const sensorsTypes = constants.sensors_type as any;
    const defaultInfrastructurePercentage = constants.add_sensors.infrastructure_percentage;
    return (
      <Container fluid className='d-flex'>
        <Loader visible={this.state.loading} fullscreen={true} />
        <Row className='w-100 justify-content-center'>
          <Card className='col-md-7 p-0'>
            <Form noValidate validated={this.state.validated} onSubmit={this.handleSubmit}>
              <Card.Header>{this.props.t('ADD_SENSOR')} {this.props.t('Test')}</Card.Header>
              <Card.Body>
                <Form.Group controlId='sensorId'>
                  <Form.Label>{this.props.t('SENSOR_ID')}</Form.Label>
                  <Form.Control required={true} type='text' placeholder={this.props.t('SENSOR_ID')} onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Group controlId='sensorType'>
                  <Container><Form.Label>{this.props.t('TYPE')}</Form.Label></Container>
                  <Dropdown as={ButtonGroup} className='w-100'>
                    <Form.Control required={true} type='text'
                      // defaultValue={this.sensors_types.find((st: any) => st.id === this.state?.type)?.friendly_name}
                      defaultValue={type?.key}
                      readOnly={true}
                    />
                    <Dropdown.Toggle id='typeDropdown' />
                    <Dropdown.Menu>
                      {
                        // this.sensors_types
                        Object.keys(constants.sensors_type)
                          .filter((key: any) => !!this.sensors_types.find((st: any) => st.code === sensorsTypes[key]?.value))
                          .map((key: any) => <Dropdown.Item key={key} eventKey={key} onSelect={this.typeSelected}>
                            {this.sensors_types.find((st: any) => st.code === sensorsTypes[key]?.value)?.friendly_name}
                          </Dropdown.Item>)
                      }
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
                {
                  type?.value === 'AQ' &&
                  <Form.Group controlId='iccid'>
                    <Form.Label>{this.props.t('ICCID')}</Form.Label>
                    <Form.Control type='text' placeholder={this.props.t('ICCID')} onChange={this.onChangeValue} />
                  </Form.Group>
                }
                <Form.Label>{this.props.t('ACCOUNT_OWNER')}</Form.Label>
                <Typeahead
                  clearButton
                  defaultInputValue={ownerAccount}
                  id="algoAccount"
                  labelKey={'account'}
                  key={'algoAccount'}
                  filterBy={(option, props) => {
                    const label = `${option.mail} - ${option.account}`.toLowerCase();
                    const searchTerm = props.text.toLowerCase();
                    return label.indexOf(searchTerm) > -1;
                  }}
                  onChange={(account) => {
                    this.setState({
                      ownerMail: account[0] ? account[0].mail : '',
                      ownerAccount: account[0] ? account[0].account : ''
                    });
                  }}
                  onBlur={(e: any) => {
                    this.setState({ ownerAccount: e.target?.value });
                  }}
                  options={this.state.accounts || []}
                  renderMenuItemChildren={(option) => (`${option.mail} - ${option.account}`)}
                />
                <Form.Group controlId='ownerMail' style={{ marginTop: '1rem' }}>
                  <Form.Label>{this.props.t('MAIL_OWNER')}</Form.Label>
                  <Form.Control required={true} type='email' placeholder={this.props.t('MAIL_OWNER')}
                    value={ownerMail} onChange={this.onChangeValue} />
                </Form.Group>
                <Form.Label>{this.props.t('ACCOUNT_INFRASTRUCTURE')}</Form.Label>
                <Typeahead
                  clearButton
                  defaultInputValue={infrastructureAccount}
                  id="algoInfraAccount"
                  labelKey={'account'}
                  key={'algoInfraAccount'}
                  filterBy={(option, props) => {
                    const label = `${option.mail} - ${option.account}`.toLowerCase();
                    const searchTerm = props.text.toLowerCase();
                    return label.indexOf(searchTerm) > -1;
                  }}
                  onChange={(account) => {
                    this.setState({
                      infrastructureMail: account[0] ? account[0].mail : '',
                      infrastructureAccount: account[0] ? account[0].account : ''
                    });
                  }}
                  onBlur={(e: any) => {
                    this.setState({ infrastructureAccount: e.target?.value });
                  }}
                  options={this.state.accounts || []}
                  renderMenuItemChildren={(option) => (`${option.mail} - ${option.account}`)}
                />
                {
                  infrastructureAccount &&
                  <Form.Group controlId='infrastructurePercentage' style={{ marginTop: '1rem' }}>
                    <Form.Label>{this.props.t('INFRASTRUCTURE_PERCENTAGE')}</Form.Label>
                    <Form.Control
                      required={true}
                      placeholder={this.props.t('INFRASTRUCTURE_PERCENTAGE')}
                      defaultValue={infrastructurePercentage || defaultInfrastructurePercentage}
                      pattern="^[1-9]$|^[0-9][0-9]$"
                      title={this.props.t('INFRASTRUCTURE_PERCENTAGE_VALIDATOR')}
                      onChange={this.onChangeValue}
                    />
                    <small>{this.props.t('INFRASTRUCTURE_PERCENTAGE_VALIDATOR')}</small>
                  </Form.Group>
                }
                <Form.Group controlId='infrastructureMail'>
                  <Form.Label>{this.props.t('MAIL_INFRASTRUCTURE')}</Form.Label>
                  <Form.Control type='email' required={!!infrastructureAccount}
                    placeholder={this.props.t('MAIL_INFRASTRUCTURE')} value={infrastructureMail} onChange={this.onChangeValue} />
                </Form.Group>
                {/* {this.state.type === constants.sensors_type.awair &&
                  <Form.Group controlId='location'>
                    <Form.Label>{this.props.t('LOCATION')}</Form.Label>
                    <Form.Control required={true} type='text'
                      placeholder={this.props.t('LOCATION')} onChange={this.onChangeValue} />
                  </Form.Group>
                } */}
                {this.calibrationParams()}
              </Card.Body>
              <Card.Footer>
                <Button type='submit'>{this.props.t('ADD')}</Button>
              </Card.Footer>
            </Form>
          </Card>
        </Row>
        <CustomAlert
          show={this.state.showError}
          message={this.state.errorMessage}
          type={this.state.errorType}
          onClose={() => this.setState({ showError: false, errorMessage: undefined })}
        />
      </Container>
    );
  }

}

export default withTranslation()(AddSensors);