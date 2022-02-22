import React, { ChangeEvent, ChangeEventHandler, useState } from 'react';
import { Form, Col } from 'react-bootstrap';
import { SelectCallback } from 'react-bootstrap/esm/helpers';
import { useTranslation } from 'react-i18next';
import SensorInput from './SensorInput';

const SensorsForm: React.FC<{ index?: number | string, onChangeValue?: ChangeEventHandler, onTypeSelected?: SelectCallback, value?: any }> =
  ({ index = '', onChangeValue, onTypeSelected, value }) => {
    const { t } = useTranslation();

    console.log(value);
    const [sensorType, setSensorType] = useState(value?.sensorType);
    const [sensorQuantity, setSensorQuantity] = useState(value?.sensorsQuantity);
    const [sensorPrice, setSensorPrice] = useState(value?.sensorsPrice);
    const [sensorVat, setSensorVat] = useState(value?.sensorsVat);
    console.log(sensorQuantity);

    const onNewTypeSelected = (type: any) => {
      if (onTypeSelected) onTypeSelected(type, type);
      setSensorType(type);
    };
    const changeValue = (e: ChangeEvent<HTMLInputElement>) => {
      const field = e.target.id.substring(0, (e.target.id.length - 1));
      const newValue = e.target.valueAsNumber;
      console.log(`${field}${newValue}`);

      if (field === 'sensorsQuantity') setSensorQuantity(newValue as any);
      else if (field === 'sensorsPrice') setSensorPrice(newValue as any);
      else if (field === 'sensorsVat') setSensorVat(newValue as any);

      if (onChangeValue) onChangeValue(e);
    };

    return (
      <>
        <Form.Row>
          <SensorInput value={sensorType} typeSelected={onNewTypeSelected} />
          <Col sm={3}>
            <Form.Group controlId={`sensorsQuantity${index}`}>
              <Form.Label>{t('QUANTITY')}</Form.Label>
              <Form.Control placeholder={t('QUANTITY')}
                required type='number' step="0.1"
                onChange={changeValue}
                value={sensorQuantity} />
            </Form.Group>
          </Col>
          <Col sm={3}>
            <Form.Group controlId={`sensorsPrice${index}`}>
              <Form.Label>{t('PRICE')}</Form.Label>
              <Form.Control placeholder={t('PRICE')}
                required type='number' step="0.1"
                onChange={changeValue}
                value={sensorPrice} />
            </Form.Group>
          </Col>
          <Col sm={3}>
            <Form.Group controlId={`sensorsVat${index}`}>
              <Form.Label>{t('VAT')}</Form.Label>
              <Form.Control placeholder={t('VAT')} required type='number' step="0.1"
                onChange={changeValue}
                value={sensorVat} />
            </Form.Group>
          </Col>
        </Form.Row>
        <hr />
      </>
    );
  };

export default SensorsForm;
