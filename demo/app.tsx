import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import './app.scss';

const route = new URLSearchParams(location.search).get('route');

const PageLoadError = () => {
  return <h3 style={{ textAlign: 'center' }}>page load error. try loading ./cases/{route}.tsx</h3>;
};

const Page = React.lazy(() => {
  return import(`./cases/${route}.tsx`).catch((err) => {
    return { default: PageLoadError };
  });
});

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
