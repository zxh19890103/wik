import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import './app.scss';

const route = new URLSearchParams(location.search).get('route');

const Page = React.lazy(() => import(`./cases/${route}`));

const Route = () => {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <Page />
      <Back />
    </Suspense>
  );
};

const Back = () => {
  return (
    <a className="App__topbar" href="/demo/index.html">
      back to home
    </a>
  );
};

const App = () => {
  return (
    <div className="App">
      <Route />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
