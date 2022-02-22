import React from 'react';
import { useTranslation } from 'react-i18next';

const NotAuthorized = () => {
  const { t } = useTranslation();

  return (
    <div className='not-authorized d-flex flex-column justify-content-center align-items-center' >
      <div><h1>{t('NO_PERMISSIONS')}</h1></div>
      <div><h1>{t('REQUEST_TO_ADMIN')}</h1></div>
    </div>
  );
};

export default NotAuthorized;