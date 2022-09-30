import React from 'react';
import ReactDOM from 'react-dom';
import { HrMap } from '../basic';

type GraphicNode = JSX.Element & {
  value: GraphicNode;
  children: GraphicNode[];
  parent: GraphicNode;
  sibling: GraphicNode;
};

export const render = (root: JSX.Element, map: HrMap) => {
  const tree: GraphicNode = {
    ...root,
    children: [],
    value: null,
    parent: null,
    sibling: null,
  };

  const gen = (node: GraphicNode) => {
    const { props, type } = node;

    const isFragment = typeof type !== 'function';

    if (isFragment) {
      node.value = null;
    } else {
      const value = node.type(props);
      if (React.isValidElement(value)) {
        node.value = { ...value } as GraphicNode;
      } else {
        node.value = null;
      }
    }

    if (node.value) {
      gen(node.value);
    }

    node.children = React.Children.map(props.children, (child) => gen({ ...child }));
  };

  // gen(tree);

  const element = document.createElement('div');

  ReactDOM.render(root, element);

  console.log(element['_reactRootContainer']);

  return null;
};
