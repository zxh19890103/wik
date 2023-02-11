import { useEffect } from 'react';
import Stats from 'stats.js';

interface Props {
  off?: boolean;
}

export const FPS = (props: Props) => {
  useEffect(() => {
    if (props.off) {
      return;
    }

    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    let stop = false;

    function animate() {
      if (stop) return;

      stats.begin();

      // monitored code goes here

      stats.end();

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    return () => {
      stop = true;
      document.body.removeChild(stats.dom);
    };
  }, [props.off]);

  return null;
};
