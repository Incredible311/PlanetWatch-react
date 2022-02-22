import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { ExclamationOctagon, ExclamationTriangle } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

export enum CustomAlertType {
  SUCCESS,
  INFO,
  ALERT,
  ERROR
}

interface CustomAlertProps {
  show: boolean,
  onClose: () => void,
  message: string | undefined,
  type?: CustomAlertType
}

function CustomAlert(props: CustomAlertProps) {
  const { t } = useTranslation();

  const type = props.type ?? CustomAlertType.ALERT;

  return (
    <Modal show={props.show} centered={true} onHide={props.onClose}>
      {type === CustomAlertType.SUCCESS &&
        <Modal.Title className='info-header' ><ExclamationTriangle className='mr-3' />{t('SUCCESS')}</Modal.Title>
      }
      {type === CustomAlertType.INFO &&
        <Modal.Title className='info-header' ><ExclamationTriangle className='mr-3' />{t('INFO')}</Modal.Title>
      }
      {type === CustomAlertType.ALERT &&
        <Modal.Title className='alert-header' ><ExclamationTriangle className='mr-3' />{t('WARNING')}</Modal.Title>
      }
      {type === CustomAlertType.ERROR &&
        <Modal.Title className='error-header' ><ExclamationOctagon className='mr-3' />{t('ERROR')}</Modal.Title>
      }
      <Modal.Body>{props.message}</Modal.Body>
      <Modal.Footer>
        <Button variant='primary' onClick={props.onClose}>
          {t('OK')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomAlert;