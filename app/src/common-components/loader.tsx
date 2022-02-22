import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

export interface LoaderProps {
  visible?: boolean,
  variant?: string,
  fullscreen?: boolean,
  className?: string
}

const Loader = (props: LoaderProps) => {
  const { t } = useTranslation();

  const spinner =
    <Spinner animation='border' role='status' variant={props.variant ?? 'light'} className={props.className}>
      <span className='sr-only'>{t('LOADING')}...</span>
    </Spinner>;

  let totalSpinner: JSX.Element;
  if (props.fullscreen) {
    totalSpinner =
      <div className='fullscreen backdrop'>
        {spinner}
      </div>;
  } else {
    totalSpinner = spinner;
  }

  return (
    <>{(props.visible !== false) && totalSpinner}</>
  );
};

export default Loader;