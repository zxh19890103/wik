import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import './index.scss';

const route = window['__ROUTE__'];

const pages = {
  demo: React.lazy(() => import('./demo')),
  dev: React.lazy(() => import('./dev')),
  dev3d: React.lazy(() => import('./dev3d')),
  complete: React.lazy(() => import('./complete')),
  animation: React.lazy(() => import('./animation')),
  minimal: React.lazy(() => import('./minimal')),
  click: React.lazy(() => import('./click')),
  performance: React.lazy(() => import('./performance')),
  edge: React.lazy(() => import('./edge')),
};

const Route = () => {
  if (!pages[route]) {
    return <h3>404</h3>;
  }

  const P = pages[route];

  return (
    <Suspense fallback={<div>page loading...</div>}>
      <P />
    </Suspense>
  );
};

const App = () => {
  return (
    <div className="App">
      <div className="App__topbar">
        <a href="/">回到目录</a>
      </div>
      <Route />
    </div>
  );
};

ReactDOM.render(<App />, document.querySelector('#app'));
