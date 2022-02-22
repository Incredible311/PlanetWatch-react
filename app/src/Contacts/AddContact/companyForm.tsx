import React, { ChangeEvent } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { withTranslation, WithTranslation } from 'react-i18next';
import ICompany from '../../Model/companyType';

interface ICompanyFormProps {
  onCompanyChange: (company: Partial<ICompany>) => void
}

interface ICompanyFormState {
  data: Partial<ICompany>
  loading: boolean,
  onCompanyChange: (company: Partial<ICompany>) => void
}

class AddContact extends React.Component<WithTranslation & ICompanyFormProps, ICompanyFormState> {

  constructor(props: WithTranslation & ICompanyFormProps) {
    super(props);
    this.state = {
      loading: false,
      data: {},
      onCompanyChange: this.props.onCompanyChange || (() => { })
    };
  }

  onChangeValue = (e: ChangeEvent<HTMLInputElement>) => {
    const field = e.target.id;
    const { value } = e.target;
    const { data } = this.state;
    Object.assign(data, { [field]: value });
    this.setState({ data });
    this.state.onCompanyChange(data);
  };

  render() {
    return <Row className='w-100 justify-content-center'>
      <Col>
        <Form.Group controlId='business_name'>
          <Form.Label>{this.props.t('BUSINESS_NAME')}</Form.Label>
          <Form.Control required type='text' onChange={this.onChangeValue} />
        </Form.Group>
      </Col>
      <Col>
        <Form.Group controlId='vat'>
          <Form.Label>{this.props.t('VAT')}</Form.Label>
          <Form.Control required type='text' onChange={this.onChangeValue} />
        </Form.Group>
      </Col>
    </Row>;
  }

}

export default withTranslation()(AddContact);