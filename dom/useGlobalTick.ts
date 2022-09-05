import { useReducer } from 'react';

let tick = 2021;

const reducer = () => {
  return ++tick;
};

export const useGlobalTick = () => {
  const [_, dispatch] = useReducer(reducer, tick);
  return dispatch;
};
