import React, { ChangeEventHandler } from 'react';
import { Form, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const ShippingForm: React.FC<{ index?: number | string, onChangeValue?: ChangeEventHandler }> = ({ index = '', onChangeValue }) => {
  const { t } = useTranslation();
  return (
    <>
      <Form.Row>
        <Form.Group as={Col} controlId={`address${index}`}>
          <Form.Label>{t('ADDRESS')}</Form.Label>
          <Form.Control required type='text' onChange={onChangeValue} />
        </Form.Group>
      </Form.Row>
      <hr/>
    </>
  );
};

export default ShippingForm;
