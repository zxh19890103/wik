import { ReactSVGOverlay } from './ReactSVGOverlay.class';
import { SvgComponentFactory } from './SVGComponentFactory';

const WithImageSvg = SvgComponentFactory<{ imageURL: string }, ReactSVGOverlay>(
  (props) => {
    const { model, data } = props;
    const { size } = model;

    return <image width={size.x} height={size.y} xlinkHref={data.imageURL} />;
  },
  'AnySVG',
  { imageURL: null },
);

export default WithImageSvg;
