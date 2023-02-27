import React, { memo } from 'react';
import { ReactSVGOverlay } from './ReactSVGOverlay.class';

export interface SvgComponentUpdateDataBase {
  size: L.PointTuple;
  angle: number;
  [k: string]: any;
}

export interface SvgComponentProps<
  D = Record<string, any>,
  M extends ReactSVGOverlay = ReactSVGOverlay,
> {
  id: string;
  data: D & SvgComponentUpdateDataBase;
  style: React.CSSProperties;
  /**
   * 一般是 svg overlay
   */
  model: M;
  svgType: string;
  className: string;
}

export interface SvgFunctionComponent<D = Record<string, any>> {
  (props: { data: any }): React.ReactElement;
  svgType: string;
  defaultData: Readonly<D & SvgComponentUpdateDataBase>;
}

const h = React.createElement;

export const SvgComponentFactory = <
  D = Record<string, any>,
  M extends ReactSVGOverlay = ReactSVGOverlay,
>(
  com: React.FunctionComponent<SvgComponentProps<D, M>>,
  type: string,
  defaultData?: D & SvgComponentUpdateDataBase,
): SvgFunctionComponent<D> => {
  /**
   * props: style, data, model, id,...
   */
  const fc = memo((props: any) => {
    const model = props.model as M;
    const layout = model.getSVGLayout();

    return h(
      'svg',
      {
        id: props.id,
        className: `wik-reactSvg wik-reactSvg-${type}`,
        viewBox: layout.viewbox,
        version: '1.1',
        xmlns: 'http://www.w3.org/2000/svg',
        xmlnsXlink: 'http://www.w3.org/1999/xlink',
      },
      h(model.svgStyleElement, {
        ...layout.styleAttrs,
        ...props.style,
      }),
      h('g', layout.gAttrs, h(com, props)),
    );
  });

  (fc as any).svgType = type;
  (fc as any).defaultData = defaultData;

  return fc as any;
};
