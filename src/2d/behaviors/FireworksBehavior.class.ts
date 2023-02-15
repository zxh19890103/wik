import L from 'leaflet';
import { IDisposable } from '@/interfaces';
import { randomColor } from '@/utils';
import { inject, interfaces, Behavior } from '@/model';
import { WikMap } from '../basic/Map.class';
import { PaneManager, PaneObject } from '../state';

const { random, PI, sin, cos } = Math;
const D2R = PI / 180;
const g: L.LatLngTuple = [-0.01, 0];

let particle_id_seed = 1992;

const randomLatLng = (around: L.LatLng, r: number) => {
  return L.latLng(around.lat + random() * 2 * r - r, around.lng + random() * 2 * r - r);
};

class Particle {
  public readonly id = particle_id_seed++;
  private bornAt: number;
  private velocity: L.LatLngTuple;
  private theta = 0;
  private dtheta = 0;
  private readonly vertex: number[];
  private dR = 6;
  private track: L.LatLng[] = [];

  constructor(private latlng: L.LatLng, private r: number, private lifetime: number) {
    this.bornAt = performance.now();
    this.velocity = [range(10, 20), range(-10, 10)];

    this.dtheta = D2R * range(-10, 10);

    const N = 3 + (0 ^ (random() * 10));
    const P = (D2R * 360) / N;

    this.vertex = Array(N)
      .fill(0)
      .map((_, i) => {
        return P * i;
      });
  }

  isDead(now: number) {
    return now - this.bornAt > this.lifetime;
  }

  drop() {
    // this.velocity = [range(-180, -90), 0];
    this.dR = 0;
  }

  move(dt = 0) {
    const { lat, lng } = this.latlng;
    const [vLat, vLng] = this.velocity;

    this.latlng = L.latLng(lat + vLat * dt, lng + vLng * dt);
    this.theta += this.dtheta;
    this.r += this.dR;

    const [gLat, gLng] = g;
    this.velocity = [vLat + gLat * dt, vLng + gLng * dt];

    this.track.push(this.latlng);
  }

  translate(dlat: number, dlng: number) {
    const { lat, lng } = this.latlng;
    this.latlng = L.latLng(lat + dlat, lng + dlng);
  }

  getLatLngs() {
    const { r, latlng, theta } = this;
    const x = latlng.lng;
    const y = latlng.lat;
    return this.vertex.map((a) => {
      return [r * sin(a + theta) + y, r * cos(a + theta) + x];
    });
  }

  getTrack() {
    return this.track;
  }
}

class Flash {
  layer: L.Circle = null;
  private lifetime = 400; // ms
  private r = 500;
  private bornAt: number = performance.now();
  private deadAt = 0;

  constructor(private around: L.LatLng, color: string) {
    this.layer = new L.Circle(around, {
      radius: this.r,
      stroke: false,
      opacity: 0.67,
      color: color,
    });
  }

  isDead(now) {
    if (!this.deadAt) {
      return false;
    }

    return now - this.deadAt > this.lifetime;
  }

  tick(now: number) {
    const elapse = now - this.bornAt;
    this.r = 4000 * sin(elapse);
    this.layer.setRadius(this.r);
    this.layer.setLatLng(randomLatLng(this.around, 300));
  }

  die() {
    this.deadAt = performance.now();
  }
}

const range = (min: number, max: number) => {
  return random() * (max - min) + min;
};

enum FireworksBehaviorPhase {
  idle = 10,
  stop = 20,
  stopped = 30,
  loop = 40,
}

export class FireworksBehavior extends Behavior implements IDisposable {
  @inject(interfaces.IPaneManager)
  paneMgr: PaneManager;

  private particles: L.Polygon = null;
  private tracks: L.Polyline = null;
  private path: Set<Particle> = null;
  private phase: FireworksBehaviorPhase = FireworksBehaviorPhase.idle;
  private around: L.LatLng = null;
  private lastMoment: number = null;
  private flash: Flash = null;
  private color: string = null;

  private pane: PaneObject = null;

  constructor(private map: WikMap) {
    super();
  }

  override onLoad(): void {
    this.pane = this.paneMgr.get('fireworksPane', 'canvas', 406);

    this.map.dragging.disable();
  }

  override onUnload(): void {
    this.map.dragging.enable();
  }

  private create() {
    this.path = new Set();

    this.color = randomColor();

    this.particles = new L.Polygon([], {
      color: randomColor(),
      opacity: 0.89,
      stroke: true,
      fill: true,
      weight: 1,
      fillColor: this.color,
      fillOpacity: 0.7,
      renderer: this.pane.renderer,
    }).addTo(this.map);

    this.tracks = new L.Polyline([], { color: this.color, opacity: 1, weight: 0.3 }).addTo(
      this.map,
    );
  }

  private tick = () => {
    if (this.phase === FireworksBehaviorPhase.stop && this.path.size === 0) {
      this.phase = FireworksBehaviorPhase.stopped;
      this.dispose();
      setTimeout(() => {
        this.phase = FireworksBehaviorPhase.idle;
      }, 0);
      return;
    }

    requestAnimationFrame(this.tick);

    const now = performance.now();
    const lat = this.around.lat + range(0, 2000);
    const lng = this.around.lng + range(-2000, 2000);

    let particle: Particle;

    if (this.phase === FireworksBehaviorPhase.loop) {
      particle = new Particle(L.latLng(lat, lng), range(30, 100), range(1000, 3000));
      this.path.add(particle);
    }

    const latlngs: any[] = [];
    const latlngs2: any[] = [];

    for (const item of this.path) {
      if (item.isDead(now)) {
        this.path.delete(item);
      } else {
        item.move(now - this.lastMoment);
        latlngs.push(item.getLatLngs());
        latlngs2.push(item.getTrack());
      }
    }

    if (this.flash) {
      if (this.flash.isDead(now)) {
        this.flash.layer.remove();
        this.flash = null;
      } else {
        this.flash.tick(now);
      }
    }

    this.lastMoment = now;
    this.tracks.setLatLngs(latlngs2);
    this.particles.setLatLngs(latlngs);
  };

  override onMouseDown(evt: L.LeafletMouseEvent): void {
    this.around = evt.latlng;

    if (this.flash) {
      this.flash.layer.remove();
      this.flash = null;
    }

    switch (this.phase) {
      case FireworksBehaviorPhase.idle: {
        this.create();
        this.lastMoment = performance.now();
        this.phase = FireworksBehaviorPhase.loop;
        this.tick();
        break;
      }
      case FireworksBehaviorPhase.loop:
        break;
      case FireworksBehaviorPhase.stop: {
        this.phase = FireworksBehaviorPhase.loop;
        break;
      }
    }

    if (this.color) {
      this.flash = new Flash(evt.latlng, this.color);
      this.flash.layer.addTo(this.map);
    }
  }

  override onMouseMove(evt: L.LeafletMouseEvent): void {
    // const dlat = evt.latlng.lat - this.lastLatlng.lat;
    // const dlng = evt.latlng.lng - this.lastLatlng.lng;
    // for (const item of this.path) {
    //   item.(dlat, dlng);
    // }
  }

  override onMouseUp(evt: L.LeafletMouseEvent): void {
    if (this.phase === FireworksBehaviorPhase.loop) {
      this.phase = FireworksBehaviorPhase.stop;
    }
    if (this.flash) {
      this.flash.die();
    }
  }

  dispose() {
    this.tracks.remove();
    this.tracks = null;
    this.particles.remove();
    this.particles = null;
    this.path = null;

    this.flash?.layer.remove();
    this.flash = null;
  }
}
