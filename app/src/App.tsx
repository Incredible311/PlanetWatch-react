import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import { PrivateRoute } from './authorization';
import './App.scss';
// eslint-disable-next-line import/extensions
import 'antd/dist/antd.css';
import Home from './Routes/home';
import constants from './constants';
import Loader from './common-components/loader';

function App() {
  const { initialized } = useKeycloak();

  if (!initialized) {
    return <Loader fullscreen={true} />;
  }

  return (
    <Router>
      <PrivateRoute path='' roles={[constants.keycloak.role]} component={Home} forRealm={true} />
    </Router>
  );
}

export default App;
