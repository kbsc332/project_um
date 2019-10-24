import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'react-app-polyfill/jsdom';

import 'es5-shim/es5-shim';
import React from 'react';
import ReactDOM from 'react-dom';
import "antd/dist/antd.css";
import './index.css';
import {Provider} from './store/store';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {isIE, browserVersion } from 'react-device-detect';

if ( isIE && (browserVersion == '10' || browserVersion == '9') ) 
{
    ReactDOM.render(
    <Provider>
       <div>IE9 is not supported. Download Chrome/Opera/Firefox</div> 
    </Provider>, document.getElementById('root'));
}
else
{
ReactDOM.render(
<Provider>
    <App />
</Provider>, document.getElementById('root'));
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
