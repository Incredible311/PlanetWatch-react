import React, { ChangeEventHandler, useState } from 'react';
import { Form, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import IAddress from '../Model/addressType';

type AddressFormProps = {
  index?: number | string,
  onChangeValue?: ChangeEventHandler,
  address?: Partial<IAddress>
};

/* eslint-disable i18next/no-literal-string */
const AddressForm: React.FC<AddressFormProps> = ({
  index = '',
  onChangeValue = (() => { }),
  address = {}
}) => {
  const { t } = useTranslation();
  const [stateAddress, setAddress] = useState(address);
  React.useEffect(() => {
    setAddress(address);
  }, [address]);

  return (
    <>
      <Form.Row>
        <Col sm={6}>
          <Form.Group controlId={`address${index}`}>
            <Form.Label>{t('ADDRESS')}</Form.Label>
            <Form.Control required type='text' name='address' defaultValue={stateAddress.address} onBlur={onChangeValue} />
          </Form.Group>
        </Col>
        <Col sm={3}>
          <Form.Group controlId={`city${index}`}>
            <Form.Label>{t('CITY')}</Form.Label>
            <Form.Control required type='text' name='city' defaultValue={stateAddress.city} onBlur={onChangeValue} />
          </Form.Group>
        </Col>
        <Col sm={3}>
          <Form.Group controlId={`postalCode${index}`}>
            <Form.Label>{t('Postal Code')}</Form.Label>
            <Form.Control required type='text' name='postalcode' defaultValue={stateAddress.postalcode} onBlur={onChangeValue} />
          </Form.Group>
        </Col>
      </Form.Row>
      <Form.Row>
        <Col sm={6}>
          <Form.Group controlId={`province${index}`}>
            <Form.Label>{t('Province')}</Form.Label>
            <Form.Control required type='text' name='province' defaultValue={stateAddress.province} onBlur={onChangeValue} />
          </Form.Group>
        </Col>
        <Col sm={6}>
          <Form.Group controlId={`country${index}`}>
            <Form.Label>{t('COUNTRY')}</Form.Label>
            <Form.Control required type='text' name='country' defaultValue={stateAddress.country} onBlur={onChangeValue} />
          </Form.Group>
        </Col>
      </Form.Row>
    </>
  );
};

export default AddressForm;
