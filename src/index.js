import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { DBProvider } from './context/DBContext';
import './index.scss';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <DBProvider>
    <App />
  </DBProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
