import { GraphicObject } from '@/interfaces';
import { Behavior } from '@/model';
import { Marker } from '../basic';
import { WikMap } from '../basic/Map.class';

export class MarkerDragBehavior extends Behavior {
  constructor(private map: WikMap) {
    super();
  }

  override onLoad(): void {}
  override onUnload(): void {}

  onPress(obj: Marker, evt: unknown): void {
    if (!(obj instanceof Marker)) return;

    obj.dragging.enable();
    console.log('onpress');

    const onUp = () => {
      console.log('onup');
      //   obj.dragging.disable();

      obj.ifRender = false;
      obj.setPosition(obj.getLatLng());

      document.removeEventListener('mouseup', onUp);
    };

    // document.addEventListener('mouseup', onUp);
  }
}
