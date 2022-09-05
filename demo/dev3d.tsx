import { useEffect, useRef } from 'react';
import './dev.scss';

export const Scene = () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {}, []);

  return <div id="devScene" ref={domRef}></div>;
};
