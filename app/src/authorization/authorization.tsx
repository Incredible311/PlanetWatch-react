/* eslint-disable max-classes-per-file */
import React, { ReactNode } from 'react';
import Keycloak, { KeycloakInstance } from 'keycloak-js';
import { ReactKeycloakProvider } from '@react-keycloak/web';

export interface AuthorizationProps {
  url: string,
  realm: string,
  clientId: string
}

class Authorization {

  private static pInstance = new Authorization();
  private keycloak?: KeycloakInstance;
  private listeners: (() => void)[] = [];

  get accessToken(): string | undefined {
    return this.keycloak?.token;
  }

  static get instance() {
    return this.pInstance;
  }

  init = (authProps: AuthorizationProps) => {
    this.keycloak = Keycloak({
      url: authProps.url,
      realm: authProps.realm,
      clientId: authProps.clientId
    });
    this.keycloak.onTokenExpired = () => {
      this.keycloak?.updateToken(60);
    };
    return this.keycloak;
  };

  private checkInit = () => {
    if (!this.keycloak) {
      /* eslint-disable-next-line i18next/no-literal-string */
      throw new Error('You must initialize Autorization! Call init!');
    }
  };

  static updateListeners = () => {
    Authorization.pInstance.listeners.forEach((x) => x());
  };

  registerListener(listener: () => void) {
    this.listeners.push(listener);
  }

  unregisterListener(listener: () => void) {
    this.listeners = this.listeners.filter((obj) => obj !== listener);
  }

  loadUserProfile = () => {
    this.checkInit();
    return this.keycloak!.loadUserProfile().then(() => Authorization.updateListeners());
  };

  userProfile = () => {
    this.checkInit();
    return this.keycloak!.profile;
  };

  isAuthenticated = () => this.keycloak?.authenticated === true;

  isAuthorized = (roles: string | string[] | undefined, forRealm: boolean | 'both' = true) => {
    let auth = false;
    let rolesArray: string[];
    if (this.keycloak?.authenticated === true) {
      if (roles !== undefined) {
        if (typeof roles === 'string') {
          rolesArray = [roles];
        } else {
          rolesArray = roles;
        }
        if (rolesArray.length > 0) {
          rolesArray.forEach((role: string) => {
            if (forRealm === 'both' && (this.keycloak?.hasRealmRole(role) || this.keycloak?.hasResourceRole(role))) {
              auth = true;
            } else if (forRealm === true && this.keycloak?.hasRealmRole(role)) {
              auth = true;
            } else if (forRealm === false && this.keycloak?.hasResourceRole(role)) {
              auth = true;
            }
          });
        } else {
          auth = true;
        }
      } else {
        auth = true;
      }
    }
    if (!auth) {
      console.log('Auth failed!');
      console.log(roles);
      console.log(this.keycloak?.authenticated);
      console.log('REALM ACCESS: ', JSON.stringify(this.keycloak?.realmAccess));
      console.log('RESOURCE ACCESS: ', JSON.stringify(this.keycloak?.resourceAccess));
      console.log('------------');
    }
    return auth;
  };

  login = () => this.keycloak!.login();

  logout = (redirectUri?: string) => {
    let uri = redirectUri;
    if (uri === undefined) {
      const url = new URL(window.location.href);
      uri = `${url.protocol}//${url.hostname}:${url.port}`;
    }
    this.keycloak?.logout({ redirectUri: uri });
  };

  refreshToken = async () => this.keycloak!.updateToken(60);

  goToProfile = () => this.keycloak!.accountManagement();

}

const AuthorizationContext = React.createContext<{ auth: Authorization | undefined }>({ auth: undefined });

export type AuthorizationProviderProps = {
  children: ReactNode;
  authorizationProps: AuthorizationProps;
};

export const authorization = Authorization.instance;

export function AuthorizationProvider(props: AuthorizationProviderProps) {
  const { children, authorizationProps } = props;

  return (
    <ReactKeycloakProvider
      authClient={authorization.init(authorizationProps)}
      onEvent={(event) => {
        if (event === 'onAuthSuccess') {
          authorization.loadUserProfile();
        }
        Authorization.updateListeners();
      }}
    >
      <AuthorizationContext.Provider value={{ auth: authorization }}>
        {children}
      </AuthorizationContext.Provider>
    </ReactKeycloakProvider>
  );
}

export const useAuthorization = () => React.useContext(AuthorizationContext);

export function withAuthorization(Component: React.ComponentType<any | string>) {
  class WithAuthorization extends React.Component {

    static displayName: string;
    state = {
      authorization: Authorization.instance
    };

    componentDidMount() {
      authorization.registerListener(this.update);
    }

    update = () => {
      this.setState({ authorization });
    };

    componentWillUnmount() {
      authorization.unregisterListener(this.update);
    }

    render() {
      return (
        <Component authorization={this.state.authorization} {...this.props} />
      );
    }

  }
  const componentName = Component.displayName || Component.name;
  WithAuthorization.displayName = `WithAuthorization(${componentName})`;
  return WithAuthorization;
}