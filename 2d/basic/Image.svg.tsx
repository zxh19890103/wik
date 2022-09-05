import { SvgComponentFactory } from './SVGComponentFactory';

const AnySVG = SvgComponentFactory<{}>(
  (props) => {
    const { model, data } = props;
    const { size } = model;
    const imageURL = data.imageURL;

    if (!__PROD__) {
      if (!imageURL) {
        throw new Error('Pls provide imageURL for THIS component.');
      }
    }

    return <image width={size.x} height={size.y} xlinkHref={imageURL} />;
  },
  'AnySVG',
  { angle: 0, size: [0, 0] },
);

export default AnySVG;
