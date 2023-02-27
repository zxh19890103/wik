import React, { memo } from 'react';
import { ReactSVGOverlay } from './ReactSVGOverlay.class';

export type SvgData = Record<string, any>;

export interface SvgComponentProps<D extends SvgData, M extends ReactSVGOverlay> {
  id: string;
  data: D;
  style: React.SVGAttributes<SVGRectElement>;
  model: M;
  sX: number;
  sY: number;
  a: number;
  svgType: string;
}

export type SvgFC = (props: any) => React.ReactElement;

export interface SvgFunctionComponent<D extends SvgData, M extends ReactSVGOverlay> {
  (props: SvgComponentProps<D, M>): React.ReactElement;
  svgType?: string;
  defaultData?: Partial<D>;
}

const h = React.createElement;

export const SvgComponentFactory = <D extends SvgData, M extends ReactSVGOverlay>(
  com: React.FC<SvgComponentProps<D, M>>,
  type: string,
  defaultData: Partial<D> = null,
): SvgFunctionComponent<D, M> => {
  /**
   * props: style, data, model, id,...
   */
  const fc = memo((props: SvgComponentProps<D, M>) => {
    const model = props.model;
    const layout = model.getSVGLayout();
    const strokeWeight = Number(props.style.strokeWidth || 1);

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
        fill: 'none',
        stroke: 'none',
        ...(model.svgStyleElement === 'rect'
          ? {
              x: strokeWeight,
              y: strokeWeight,
              width: layout.size - strokeWeight * 2,
              height: layout.size - strokeWeight * 2,
            }
          : {
              cx: layout.r,
              cy: layout.r,
              r: layout.r - strokeWeight,
            }),
        ...props.style,
      }),
      h('g', { transform: layout.transform }, props.data ? h(com, props) : null),
    );
  }) as SvgFunctionComponent<D, M>;

  fc.svgType = type;
  fc.defaultData = defaultData;

  return fc;
};

/**
 * alias of SvgComponentFactory
 */
export const cSvgFc = SvgComponentFactory;
