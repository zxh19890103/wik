import { Util } from 'leaflet';
import { Constructor } from '../interfaces/Constructor';

export function leafletOptions<O>(o: O) {
  return function (target: Constructor) {
    const ThisClass = target;
    const proto = ThisClass.prototype;

    /**
     * why here calls Util.extend ? How about Object.assign ? It uses `for-in` loop statements.
     */
    Util.extend(proto, { options: o });

    // Make option has its own chain.
    const parentProto = proto.__proto__;
    proto.options = parentProto.options ? Object.create(parentProto.options) : {};

    Util.extend(proto.options, o);
  };
}
