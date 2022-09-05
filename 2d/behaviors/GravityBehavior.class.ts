import L, { LatLng } from 'leaflet';
import { Behavior } from '../../model/behaviors';
import { randomColor } from '../../utils';
import { HrMap } from '../basic/Map.class';

const { random, PI, sin, cos, abs, sqrt, pow } = Math;
const D2R = PI / 180;
const G = 6000000000000;
const K = 0.0000000003;

const random2 = (min: number, max: number) => {
  return min + random() * (max - min);
};

const randomLatLng = (around: L.LatLng, r: number) => {
  return L.latLng(around.lat + random() * 2 * r - r, around.lng + random() * 2 * r - r);
};

const normalize = (latlng: L.LatLngTuple, k = 1): L.LatLngTuple => {
  const [y, x] = latlng;
  const len = sqrt(x * x + y * y);
  return [(y * k) / len, (x * k) / len];
};

const distanceSQ = (latlng0: L.LatLng, latlng1: LatLng) => {
  const dx = latlng0.lng - latlng1.lng;
  const dy = latlng0.lat - latlng1.lat;

  return dx * dx + dy * dy;
};

const length2 = (latlng: L.LatLngTuple) => {
  const [y, x] = latlng;
  return sqrt(x * x + y * y);
};

/**
 * a's projection on b
 */
const project = (a: L.LatLngTuple, b: L.LatLngTuple): L.LatLngTuple => {
  const len = sqrt(b[0] * b[0] + b[1] * b[1]);
  if (len === 0) {
    return [0, 0];
  }

  const dot = a[0] * b[0] + a[1] * b[1];
  const k = dot / len;
  const unit = normalize(b);
  return [k * unit[0], k * unit[1]];
};

const collide = (b0: Body, b1: Body) => {
  const b0TOb1 = [b1.latlng.lat - b0.latlng.lat, b1.latlng.lng - b0.latlng.lng] as L.LatLngTuple;

  // velocity project on rLatLng
  const v1 = project(b1.velocity, b0TOb1);
  const v0 = project(b0.velocity, b0TOb1);

  const m0 = b0.mass,
    m1 = b1.mass,
    r = m1 / m0;

  // force on m1
  const F = [m0 * v0[0] - m1 * v1[0], m0 * v0[1] - m1 * v1[1]];
  const dV1 = [F[0] * K, F[1] * K];

  b1.velocity[0] += dV1[0];
  b1.velocity[1] += dV1[1];

  const dV0 = [-r * dV1[0], -r * dV1[1]];

  b0.velocity[0] += dV0[0];
  b0.velocity[1] += dV0[1];
};

let body_id_seed = 1992;

class Body {
  private readonly bornAt: number = performance.now();
  public readonly id = body_id_seed++;
  readonly layer: L.Circle;
  readonly lifetime: number = random2(600000, 800000);
  track: L.LatLng[] = [];
  mass = 0;
  r = 0;

  constructor(public latlng: L.LatLng, public velocity: L.LatLngTuple) {
    this.r = random2(100, 600);
    this.mass = 1.3333 * PI * pow(this.r, 3);

    this.layer = new L.Circle(latlng, {
      interactive: false,
      stroke: false,
      fill: true,
      fillColor: randomColor(),
      fillOpacity: 1,
      radius: this.r,
    });
  }

  run(now: number, dt: number, a: L.LatLngTuple) {
    const { lat, lng } = this.latlng;
    const [vlat, vlng] = this.velocity;
    this.latlng = new L.LatLng(lat + vlat * dt, lng + vlng * dt);
    this.velocity = [vlat + a[0] * dt, vlng + a[1] * dt];
    this.layer.setLatLng(this.latlng);
    const energy = (this.lifetime - (now - this.bornAt)) / this.lifetime;
    this.layer.setStyle({ fillOpacity: energy });
    this.track.push(this.latlng);
  }

  isDead(now: number) {
    return now - this.bornAt > this.lifetime;
  }

  computeAcc(body: Body): L.LatLngTuple {
    const { lat, lng } = body.latlng;
    const latlng = this.latlng;

    const dist = distanceSQ(this.latlng, body.latlng);
    const min = this.r * this.r + body.r * body.r;

    if (dist < min) {
      return null;
    }

    const k = (body.mass * this.mass) / (G * dist);
    if (isNaN(k) || !isFinite(k)) return [0, 0];

    return normalize([lat - latlng.lat, lng - latlng.lng], k);
  }

  eat(body: Body) {
    // 1.3333 * PI * pow(this.r, 3);
    // 10% transformed to be heat energy.
    const f = (0.9 * body.mass) / this.mass;
    const dv0 = body.velocity[0] * f;
    const dv1 = body.velocity[1] * f;

    this.mass += body.mass;
    this.velocity[0] += dv0;
    this.velocity[1] += dv1;
    this.r = pow((this.mass * 0.75) / PI, 1 / 3);
    this.layer.setRadius(this.r);
  }
}

export class GravityBehavior extends Behavior {
  private bodies: Set<Body> = new Set();
  private track: L.Polyline = null;
  private around: L.LatLng = null;
  private lastMoment: number = null;
  private star: L.Circle = null;

  constructor(private map: HrMap) {
    super();
  }

  onLoad(): void {}

  onUnload(): void {
    this.bodies.forEach((x) => x.layer.remove());
    this.bodies.clear();
    this.track?.remove();
    this.track = null;
    this.star?.remove();
    this.star = null;
    this.around = null;
    this.lastMoment = null;
  }

  private generate() {
    // const latlng = randomLatLng(this.around, 10000);
    const latlng = L.latLng(0, random2(-10000, 10000)); // randomLatLng(this.around, 6000);
    // const velocity = [random2(-0.05, 0.05), random2(-0.05, 0.05)] as L.LatLngTuple;
    const velocity = [0, random2(-1, 1)] as L.LatLngTuple;
    const one = new Body(latlng, velocity);
    one.layer.addTo(this.map);
    this.bodies.add(one);
  }

  private computeAcc(body: Body) {
    const a = [0, 0];
    for (const other of this.bodies) {
      if (other === body) continue;
      const da = body.computeAcc(other);

      if (da === null) {
        // if (body.mass > other.mass) {
        //   this.mergeBody(body, other);
        //   continue;
        // } else {
        //   this.mergeBody(other, body);
        //   return null;
        // }
        collide(other, body);
        continue;
      }

      a[0] += da[0];
      a[1] += da[1];
    }
    return a as L.LatLngTuple;
  }

  private mergeBody(body: Body, body1: Body) {
    body.eat(body1); // collide must lead motion energy decreases.
    this.bodies.delete(body1);
    body1.layer.remove();
  }

  private run = () => {
    if (!this.lastMoment) return;

    requestAnimationFrame(this.run);

    const now = performance.now();

    const latlngs = [];

    for (const body of this.bodies) {
      if (body.isDead(now)) {
        this.bodies.delete(body);
        body.layer.remove();
      } else {
        const a = this.computeAcc(body);
        if (a === null) continue;
        body.run(now, now - this.lastMoment, a);
        latlngs.push(body.track);
      }
    }

    this.track.setLatLngs(latlngs);

    this.lastMoment = now;
  };

  override onNoopClick(evt: L.LeafletMouseEvent): void {
    for (let i = 0; i < 3; i++) {
      this.generate();
    }

    for (const body of this.bodies) {
      body.track = [];
    }

    this.star.setLatLng(evt.latlng);
  }

  override onMouseDown(evt: L.LeafletMouseEvent): void {
    this.around = evt.latlng;

    if (!this.lastMoment) {
      this.lastMoment = performance.now();
      this.track = new L.Polyline([], { color: '#111', opacity: 0.4, weight: 1 }).addTo(this.map);
      this.star = new L.Circle(this.around, { color: '#f34', radius: 100 }).addTo(this.map);
      this.run();
    }
  }

  override onMouseMove(evt: L.LeafletMouseEvent): void {}

  override onMouseUp(evt: L.LeafletMouseEvent): void {}
}
