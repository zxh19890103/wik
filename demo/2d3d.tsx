import L from 'leaflet';
import { EssWarehouse, basic } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { Scene } from '../dom/general/index';
import { useEffect, useRef, useState } from 'react';
import { inject, rootInjector, provides } from '../model/basic';
import { IInjector } from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';
import { Warehouse3D } from '../3d/Warehouse.class';
import THREE from 'three';
import './ioc.config';
import { ArcballControls } from '../3d/controls/ArcballControl.class';
import { appendAnimation, RotationAnimation } from '../2d/animation';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const icon = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/robotic-arm-51-1126917.png';

    await this.imageManager.load(icon);

    const point = new basic.Circle([0, 0], { radius: 1000, color: '#097' });
    this.add('point', point);

    const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(icon), 1000, 1000);
    this.add('bot', bot);

    let angle = 0;

    const loop = () => {
      setTimeout(loop, 3000);
      appendAnimation.call(bot, new RotationAnimation(bot, (angle += 180)));
    };

    loop();
  }
}

class MyWarehouse3D extends Warehouse3D {
  layout(data?: unknown): void | Promise<void> {}
}

export default () => {
  const [warehouse0] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return (
    <Scene.Layout flow="horizontal">
      <Scene flex={1} warehouse={warehouse0} border />
      <Scene3D />
    </Scene.Layout>
  );
};

const Scene3D = () => {
  const elementRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const element = elementRef.current;

    const w = element.clientWidth,
      h = element.clientHeight;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();

    element.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, w / h, 1, Number.MAX_SAFE_INTEGER);
    camera.position.set(3000, 5000, 1000);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    const scene = new THREE.Scene();

    const controls = new ArcballControls(camera, renderer.domElement, scene);
    controls.update();

    // lights
    {
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 0, 1);
      scene.add(light);
      const amlight = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(amlight);
      // const sky = new THREE.HemisphereLight(0x2345f5, 0xff0000);
      // scene.add(sky);
    }

    // ground
    {
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000, 500, 500),
        new THREE.MeshPhongMaterial({ color: 0x454545 }),
      );

      ground.position.set(0, 0, 0);
      scene.add(ground);
    }

    // points
    {
      const material = new THREE.MeshPhongMaterial({ color: 0x90ff00 });

      for (let x = -20; x < 20; x++) {
        for (let y = -20; y < 20; y++) {
          const dot = new THREE.Mesh(new THREE.CircleGeometry(20, 20), material);
          dot.position.set(x * 50, y * 50, 0);
          scene.add(dot);
        }
      }
    }

    // shelfs
    {
      const material = new THREE.MeshPhongMaterial({ color: 0x991100 });

      for (let x = -20; x < 20; x++) {
        for (let y = -20; y < 20; y++) {
          const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), material);
          box.position.set(x * 50, y * 50, 0);
          scene.add(box);
        }
      }
    }

    // a ball
    {
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(100, 60, 60),
        new THREE.MeshPhongMaterial({ color: 0x00ff99 }),
      );

      ball.position.set(0, 0, 700);
      scene.add(ball);
    }

    const loop = () => {
      requestAnimationFrame(loop);
      renderer.render(scene, camera);
    };

    loop();
  }, []);

  return <div style={{ flex: 1, height: '100vh' }} ref={elementRef} />;
};
