import React from 'react';
import { ButtonGroup, Container, Dropdown, Form, Col } from 'react-bootstrap';
import { SelectCallback } from 'react-bootstrap/esm/helpers';
import { useTranslation } from 'react-i18next';
import constants from '../constants';

const SensorInput: React.FC<{ type?: any, typeSelected?: SelectCallback, value?: any, filter?: string[] }> =
  ({ type, typeSelected, value, filter }) => {
    const { t } = useTranslation();
    /* eslint-disable i18next/no-literal-string */
    const items = [
      { eventKey: 'atmotube', label: constants.sensors_type.atmotube.key },
      { eventKey: 'airly_pm', label: constants.sensors_type.airly_pm.key },
      { eventKey: 'airly_pm_no2_03', label: constants.sensors_type.airly_pm_no2_03.key },
      { eventKey: 'airly_pm_so2_co', label: constants.sensors_type.airly_pm_so2_co.key },
      { eventKey: 'wiseair', label: constants.sensors_type.wiseair.key },
      { eventKey: 'awair', label: constants.sensors_type.awair.key },
      { eventKey: 'airqino', label: constants.sensors_type.airqino.key }
    ];

    return (
      <Form.Group as={Col} controlId='sensorType'>
        <Container><Form.Label>{t('TYPE')}</Form.Label></Container>
        <Dropdown as={ButtonGroup} className='w-100'>
          <Form.Control value={value} required={true} type='text' defaultValue={type?.key} readOnly={true} />
          <Dropdown.Toggle id='typeDropdown' />
          <Dropdown.Menu>
            {
              items.filter((i) => (!filter ? true : filter.indexOf(i.eventKey) > -1))
                .map((i) => <Dropdown.Item
                  key={i.eventKey}
                  eventKey={i.eventKey}
                  onSelect={typeSelected}
                >
                  {i.label}
                </Dropdown.Item>)
            }
          </Dropdown.Menu>
        </Dropdown>
      </Form.Group>
    );
  };

export default SensorInput;