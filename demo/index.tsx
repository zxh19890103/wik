import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';

import './index.scss';

const route = window['__ROUTE__'];

const pages = {
  demo: React.lazy(() => import('./demo')),
  dev: React.lazy(() => import('./dev')),
  dev3d: React.lazy(() => import('./dev3d')),
  animation: React.lazy(() => import('./animation')),
  minimal: React.lazy(() => import('./minimal')),
  click: React.lazy(() => import('./click')),
  performance: React.lazy(() => import('./performance')),
  edge: React.lazy(() => import('./edge')),
  route: React.lazy(() => import('./route')),
  'multiple-map': React.lazy(() => import('./multi-map')),
  ess: React.lazy(() => import('./ess')),
  render: React.lazy(() => import('./render')),
  'cross-zone': React.lazy(() => import('./cross-zone')),
  group: React.lazy(() => import('./group')),
  'redo-undo': React.lazy(() => import('./redo-undo')),
  '2d3d': React.lazy(() => import('./2d3d')),
  general: React.lazy(() => import('./general')),
};

const Route = () => {
  const Page = pages[route];

  if (!Page) {
    return <Home />;
  }

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

const Home = () => {
  return (
    <div style={{ background: 'white' }}>
      <h3>Welcome!</h3>
      <div>
        <ol>
          {Object.entries(pages).map((page) => {
            return (
              <li key={page[0]}>
                <a href={`?route=${page[0]}`}>{page[0]}</a>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
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
