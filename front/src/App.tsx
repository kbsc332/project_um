import 'es5-shim/es5-shim';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import {IntlProvider, FormattedMessage} from 'react-intl';
import { ApolloProvider } from "react-apollo";
import { Client } from './apollo/client';
import locale from './locale/locale';
import routes from './routes';
import MainLayout from './common/MainLayout';

import Main from './view/Main';
import Login from './login/Login';

import {  } from './store/reducer';
import {LoginAction, LogoutAction, UpdateMiningDataAction, UpdateAccountDataAction } from './store/actions';
import {useRedux, UseRedux} from './store/store';


import * as Selectors from './store/selectors';
import {CheckSessionQuery } from './apollo/query';
import Admin from './admin/Admin';

// 언어 설정..
let currentLocale = navigator.language;//.split(/[-_]/)[0];

if ( !locale[currentLocale] )
  currentLocale = null;

const App: React.FC = () => {

  const [AppState, AppActions] = UseRedux();

  const setLogInUser = (user: any) => AppActions.logInUser(user);
  const setLogOutUser = () => AppActions.logOutUser();
  
  const [values, setValues] = useState({
    language : currentLocale || localStorage.getItem('language') || 'en'
  });


  useEffect(() => {
    if (AppState.user.session) {
      Client.query({
        query: CheckSessionQuery,
        variables: { account: AppState.user.accountID, session: AppState.user.session },
      }).then((result: any) => {
        if (result.data && result.data.checkSession) {
          // 세션 유효.
        }
        else {
          setLogOutUser();
        }
      }).catch((error: Error) => {
        setLogOutUser();
      })
    }
    else {
      AppState.isLoggedIn = false;
    }
  }, [])
  
  const ChangeLanguage = (language) => {
    if ( locale[language] == null )
      language = 'en'
    localStorage.setItem('language', language);
    setValues(initial => {
      return {
          ...initial,
          language: language
      };
  });
  };

  return (
    <ApolloProvider client={Client}>
      <IntlProvider locale={values.language} messages={locale[values.language]}>
          <Router>
            <div style={ values.language == 'en' ? {fontFamily: '"Noto Sans KR", sans-serif'} : {fontFamily: '"Noto Sans KR", sans-serif'}}>
            <MainLayout setLogOutUser={setLogOutUser} changeLanguage={ChangeLanguage}>
              <Switch>
                {routes.map((route, index) => {
                  return (<Route
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    component={route.component}
                  />);
                }
                )}

                <Route key={'login'}
                  path="/login"
                  render={() => <Login setLogInUser={setLogInUser} />}
                />
                <Route key={'adminnnnn'}
                      path={"/admin/admin/admin"}
                      render={()=><Admin/>}
                      />
              </Switch>
            </MainLayout>

          </div>
        </Router>
      </IntlProvider>
    </ApolloProvider>
  );
}

export default App;
