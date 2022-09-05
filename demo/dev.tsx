import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import 'leaflet/dist/leaflet.css';
import './dev.scss';

import * as hrGUI from '../2d';
import * as hrGUIBasic from '../2d/basic';

L.Icon.Default.imagePath = `${__ENV__.MINIO_END}/fe-libs/leaflet-static/`;

export const Scene = () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const root = new HrMap(domRef.current, {});

    const list = new hrGUIBasic.LayerList();
    list.mount(root);

    const svgServer = new hrGUIBasic.ReactSVGOverlayAppServer().bootstrap(root, 'reactSVGPane');
    // const selectionMgr = new hrGUI.SelectionManager();

    const shelf = new hrGUI.Shelf([3000, 5000], {
      columns: 4,
      rows: 1,
      unitW: 240,
      unitL: 400,
      gapL: 20,
      gapW: 20,
      pilarR: 20,
    });

    const shelf2 = new hrGUI.Shelf([5000, 5000], {
      columns: 4,
      rows: 2,
      unitW: 240,
      unitL: 500,
      gapL: 20,
      gapW: 20,
      pilarR: 20,
    });

    const shelf3 = new hrGUI.Shelf([5000, 9000], {
      columns: 8,
      rows: 2,
      unitW: 240,
      unitL: 600,
      gapL: 20,
      gapW: 20,
      pilarR: 20,
    });

    const point = new hrGUI.Point([4000, 4000], { type: 'rest' });

    const robot = new hrGUI.Robot(svgServer);

    const chagepile = new hrGUI.Chargepile([4000, 6000], svgServer);
    const haiport = new hrGUI.Haiport([5000, 4000], svgServer);

    // const cacheShelf = new hrGUI.CacheShelf();

    const node = new hrGUI.ConveyorNode([300, 700], { type: 'IN' });
    const node1 = new hrGUI.ConveyorNode([1200, 900], { type: 'OUT' });

    const conveyor = new hrGUI.Conveyor([node, node1], { type: 'singleIO' });

    // cacheShelf.addReactiveLayers(shelf, shelf2, shelf3);

    list.addRange(chagepile, point, haiport);

    const loc = new hrGUI.Location([1000, 2000], { type: 'labor' });

    // root.addLayer(cacheShelf);
    root.addLayer(conveyor);
    root.addLayer(robot);
    root.addLayer(loc);
  }, []);

  return <div id="devScene" ref={domRef}></div>;
};
