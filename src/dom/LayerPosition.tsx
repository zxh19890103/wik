import { memo } from 'react';
import { ReactiveLayer } from '../mixins';
import { useLeafletEvented } from './useLeafletEvented';

export const LayerPosition = memo((props: { model: ReactiveLayer }) => {
  const { model } = props;

  useLeafletEvented(model, 'position angle');

  const { position, angle } = model;

  return (
    <div>
      <label>X,Y:</label>
      {Math.round(position.lng)}, {Math.round(position.lat)}
      <br />
      <label>Deg: </label>
      {Math.round(angle)}
    </div>
  );
});
