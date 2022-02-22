import * as React from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import type { RouteProps } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import NotAuthorized from './notAuthorized';
import { useAuthorization } from './authorization';

interface PrivateRouteParams extends RouteProps {
  component:
  | React.ComponentType<RouteComponentProps<any>>
  | React.ComponentType<any>
  roles?: string[];
  forRealm?: boolean
}

export function PrivateRoute({
  component: Component,
  roles,
  forRealm,
  ...rest
}: PrivateRouteParams) {
  const { auth } = useAuthorization();
  const { t } = useTranslation();

  if (auth?.isAuthenticated() === false) {
    auth?.login().then(() => auth.loadUserProfile());
    return <div>{t('LOGIN_NEEDED')}</div>;
  }
  return (
    <Route
      {...rest}
      render={(props) => (
        auth?.isAuthorized(roles, forRealm)
          ? <Component {...props} />
          : <NotAuthorized />
      )}
    />
  );
}

export default PrivateRoute;