import React, { ChangeEventHandler, useState } from 'react';
import { Col, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

type MailFormProps = {
  index?: number | string,
  onChangeValue?: ChangeEventHandler,
  mail?: string
};

/* eslint-disable i18next/no-literal-string */
const MailForm: React.FC<MailFormProps> = ({
  index = '',
  onChangeValue = (() => { }),
  mail = ''
}) => {
  const { t } = useTranslation();
  const [stateMail, setMail] = useState(mail);
  React.useEffect(() => {
    setMail(mail);
  }, [mail]);

  return (
    <>
      <Form.Row>
        <Col sm={12}>
          <Form.Group controlId={`${index}`}>
            <Form.Label>{t('MAIL')}</Form.Label>
            <Form.Control required type='text' name='mail' defaultValue={stateMail} onBlur={onChangeValue} />
          </Form.Group>
        </Col>
      </Form.Row>
    </>
  );
};

export default MailForm;
