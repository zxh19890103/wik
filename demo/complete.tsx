import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as Util from '../utils';
import * as hrGUI from '../2d';
import * as hrGUIBasic from '../2d/basic';

import * as hrModel from '../model';
import { SVG_KUBOT } from '../2d/images';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class MyRobotView extends hrGUI.Robot implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate(dxy) {
    const { x, y } = dxy;
    this.translate(y, x);
  }

  whenRotate(dd: number) {
    this.rotate(dd);
  }

  whenTrash(): void {
    this.remove();
  }

  whenEffect(effect: hrModel.RobotEffect): void {
    // throw new Error('Method not implemented.');
  }
}

class MyRobotView2 extends hrGUIBasic.Polygon implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate(dxy: { x: number; y: number }) {
    // throw new Error('Method not implemented.');
    this.translate(dxy.y, dxy.x);
  }

  whenRotate(dd: number) {
    this.rotate(dd);
    // throw new Error('Method not implemented.');
  }

  whenTrash(): void {
    // throw new Error('Method not implemented.');
  }

  whenEffect?(effect: hrModel.RobotEffect): void {
    // throw new Error('Method not implemented.');
  }
}

class MyRobotView3 extends hrGUIBasic.ImageLayer implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate(dxy: { x: number; y: number }) {
    // throw new Error('Method not implemented.');
    this.translate(dxy.y, dxy.x);
  }

  whenRotate(dd: number) {
    // this.
    this.rotate(dd);
  }
  whenTrash(): void {
    // throw new Error('Method not implemented.');
  }
  whenEffect?(effect: hrModel.RobotEffect): void {
    // throw new Error('Method not implemented.');
  }
}

interface EssPointState {}
class EssPoint extends hrGUI.Point {}

const Scene = (props: { points: any[]; locations: any[] }) => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const { random } = Math;
    const root = new HrMap(domRef.current, {});

    // hrGUI.interactivateAllPanes(root, null);

    // const list = new hrGUIBasic.LayerList<MyRobotView2>();
    // list.mount(root);

    // const svgServer = new hrGUIBasic.ReactSVGOverlayAppServer().bootstrap(
    //   root,
    //   'reactSVGPane',
    //   true,
    // );

    // const svgServer1 = new hrGUIBasic.ReactSVGOverlayAppServer().bootstrap(
    //   root,
    //   'nasbSVGPane',
    //   true,
    // );

    // const svgServer2 = new hrGUIBasic.ReactSVGOverlayAppServer().bootstrap(
    //   root,
    //   'mkhgSVGPane',
    //   true,
    // );

    // const robot = new hrModel.Robot();

    // for (let i = 0; i < 1250; i++) {
    //   const robotView = new MyRobotView2([
    //     [300, 400],
    //     [500, 100],
    //     [200, 900],
    //     [900, 10],
    //     [900, 900],
    //   ]);
    //   robotView.position = L.latLng(random() * 10000, random() * 10000);
    //   robotView.angle = Util.randomInt(-180, 180);
    //   hrModelBasic.viewConstructMixin.call(robotView, robot, {});
    //   list.add(robotView);
    // }

    // for (let i = 0; i < 100; i++) {
    //   const robotView = new MyRobotView(svgServer1, { type: 'kubo' });
    //   robotView.position = L.latLng(random() * 6000, random() * 6000);
    //   robotView.angle = Util.randomInt(-180, 180);
    //   hrModelBasic.viewConstructMixin.call(robotView, robot, {});
    //   list.add(robotView);
    // }

    // for (let i = 0; i < 100; i++) {
    //   const robotView = new MyRobotView(svgServer2, { type: 'kubo' });
    //   robotView.position = L.latLng(random() * 6000, random() * 6000);
    //   robotView.angle = Util.randomInt(-180, 180);
    //   hrModelBasic.viewConstructMixin.call(robotView, robot, {});
    //   list.add(robotView);
    // }

    // let a = 0;

    const robotViews: MyRobotView3[] = [];

    const image = new Image();
    image.src = SVG_KUBOT;

    hrGUIBasic.setDefaultImage(MyRobotView3, SVG_KUBOT);

    const pane = root.createPane('robotPane');
    const renderer = L.canvas({ pane: 'robotPane' });
    hrGUI.manageRenderer('robotPane', renderer);
    setTimeout(() => {
      hrGUI.manageRenderer('overlayPane', (root as any)._renderer);
    }, 100);

    for (let i = 0; i < 1000; i++) {
      const imageLayer = new MyRobotView3(null, 1000, 1000);
      imageLayer.options.renderer = renderer;
      imageLayer.position = L.latLng(random() * 30000, random() * 30000);
      root.addLayer(imageLayer);
      robotViews.push(imageLayer);
    }

    const points: hrGUI.Point[] = [];
    for (const p of props.points) {
      const { x, y } = p.position;
      points.push(new hrGUI.Point([y, x]).addTo(root));
    }

    for (let i = 0; i < 30000; i++) {
      const location = props.locations[i];
      const { x, y } = location.position;
      new hrGUIBasic.Rectangle([y, x], 500, 500).addTo(root);
    }

    const pointsLen = props.points.length;
    const viewsLen = robotViews.length;

    const loop = () => {
      requestAnimationFrame(loop);
      const index = 0 ^ (Math.random() * viewsLen);
      const view = robotViews[index];
      view.rotate(Util.randomInt(0, 360));
      const index2 = 0 ^ (Math.random() * pointsLen);
      const point = points[index2];
      view.setPosition(point.position);
    };

    setTimeout(loop, 1000);
  }, []);

  return <div id="devScene" ref={domRef} />;
};

export default () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/__data__/xianbei')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        console.log(d.point.length, d.location.length);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <em>loading...</em>;
  }

  return <Scene points={data.point} locations={data.location} />;
};
