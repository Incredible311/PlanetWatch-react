import React from 'react';
import { Route, Switch } from 'react-router-dom';
import PwNavBar from '../common-components/pwNavBar';
import { PrivateRoute, withAuthorization } from '../authorization';
import PwSidebar from '../common-components/pwSidebar';
import routes from './routes';

class Home extends React.Component<any> {

  render() {
    return (
      <>
        <PwNavBar username={this.props.authorization.userProfile()?.username} />
        <PwSidebar username={this.props.authorization.userProfile()?.username} />
        <div className='content-wrapper p-4'>
          <Switch>
            {
              routes.map((r) => (
                <Route exact path={r.path} key={r.path}>
                  <PrivateRoute
                    path=''
                    roles={r.roles}
                    component={r.component!!}
                    forRealm={r.forRealm}
                  />
                </Route>
              ))
            }
          </Switch>
        </div>
        <footer className='main-footer'>
          <div className='float-right'>
            {process.env.REACT_APP_VERSION_TAG ? process.env.REACT_APP_VERSION_TAG : process.env.REACT_APP_VERSION}
          </div>
        </footer>
      </>
    );
  }

}

export default withAuthorization(Home);