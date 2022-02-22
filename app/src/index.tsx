import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import Axios from 'axios';

// Try to avoid npm run build remove something needed for dropdowns,
// so dropdowns should work wells also on prodution builds
import 'bootstrap';
import 'popper.js';

import './index.scss';
import './i18n';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { AuthorizationProvider, AxiosRequestInterceptorProvider, AxiosResponseInterceptorProvider } from './authorization';
import constants from './constants';

Axios.interceptors.request.use(AxiosRequestInterceptorProvider);
Axios.interceptors.response.use(AxiosResponseInterceptorProvider);

ReactDOM.render(
  <React.StrictMode>
    <Suspense fallback={<div></div>}>
      <AuthorizationProvider authorizationProps={constants.keycloak}>
        <App />
      </AuthorizationProvider>
    </Suspense>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
