import React, { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { leaflet_buitlin_panes } from './constants';
import { WikMap } from './Map.class';
import { ReactSVGOverlay } from './ReactSVGOverlay.class';
import { SvgData, SvgFC, SvgFunctionComponent } from './SVGComponentFactory';

interface SVG {
  id: string;
  component: SvgFunctionComponent<SvgData, ReactSVGOverlay<SvgData>>;
  data?: SvgData;
  style?: React.CSSProperties;
  model?: ReactSVGOverlay<SvgData>;
}

type SVGPool = { value: Map<string, SVG> };
type SVGPoolAction = { type: 'init' | 'add' | 'remove' | 'update' | 'clear'; payload?: any };
type AfterRenderPromiseSettleFn = (val?: HTMLElement) => void;
type AfterRenderPromiseKey = { svgid: string; action: 'add' | 'update' };

/**
 * 用于渲染 svg 组件的服务
 */
class ReactSVGOverlayAppServer {
  map: WikMap;
  pane: string;
  isRunning = false;
  isMounted = false;

  paneElement: HTMLDivElement;
  leafletPanesElement: HTMLDivElement;
  svgToAdd: SVG[] = null;

  private settleAfterRenderPromisesQueue: Map<AfterRenderPromiseKey, AfterRenderPromiseSettleFn> =
    new Map();

  addComponent: (
    component: SvgFC,
    id: string,
    model: any,
    data: any,
    style?: any,
  ) => Promise<HTMLElement> = null;

  updateComponent: (id: string, data: any, style?: any) => Promise<HTMLElement> = null;
  removeComponent: (id: string) => void = null;
  clearComponents: () => void = null;

  getSVGElement(id: string): HTMLDivElement {
    if (!this.isRunning) return null;
    return this.paneElement.querySelector(`#${id}`) || null;
  }

  queueAysncUpdate(svgid: string, settlefn: any, action: 'add' | 'update') {
    this.settleAfterRenderPromisesQueue.set({ svgid, action }, settlefn);
  }

  clearQueuedAysncUpdates() {
    if (this.settleAfterRenderPromisesQueue.size === 0) return;

    const entries = [...this.settleAfterRenderPromisesQueue];

    for (const [key, fn] of entries) {
      fn(this.getSVGElement(key.svgid));
    }

    this.settleAfterRenderPromisesQueue.clear();
  }

  bootstrap(map: WikMap, pane: string) {
    if (this.isRunning) {
      return this;
    }

    if (!__PROD__) {
      if (leaflet_buitlin_panes.indexOf(pane) !== -1) {
        throw new Error(
          `You should not use the built-in panes in svg server, which includes: ${leaflet_buitlin_panes}`,
        );
      }
    }

    this.pane = pane;
    this.map = map;

    this.addComponent = (...args: any) => {
      return new Promise((r) => {
        if (!this.svgToAdd) this.svgToAdd = [];

        // these items will be init after app mounted.
        this.svgToAdd.push({
          id: args[1],
          component: args[0],
          model: args[2],
          data: args[3],
          style: args[4],
        });

        this.queueAysncUpdate(args[1], r, 'add');
      });
    };

    this.preparePaneElement();
    // const portal = ReactDOM.createPortal(<ReactSVGOverlayApp server={this} />, this.paneElement);
    ReactDOM.render(<ReactSVGOverlayApp server={this} />, this.paneElement);

    this.isRunning = true;
    return this;
  }

  private preparePaneElement() {
    this.leafletPanesElement = this.map._container.querySelector('.leaflet-map-pane');
    this.paneElement = this.leafletPanesElement.querySelector(
      `.leaflet-${this.pane}-pane`,
    ) as HTMLDivElement;
  }

  teardown() {
    if (!this.isRunning) return;

    if (this.clearComponents) {
      this.clearComponents();
    }

    this.leafletPanesElement = null;
    this.paneElement = null;
    this.map = null;
    this.isRunning = false;
    this.isMounted = false;
  }
}

const reducer = (svgs: SVGPool, action: SVGPoolAction): SVGPool => {
  const { payload } = action;
  const value = svgs.value;

  switch (action.type) {
    case 'add': {
      const { svgId, component, data } = payload;
      const svg: SVG = {
        ...payload,
        id: svgId,
        component,
        data: data || component.defaultData,
      };
      value.set(svgId, svg);
      return { value };
    }
    case 'init': {
      const svgs = payload as SVG[];
      for (const svg of svgs) {
        value.set(svg.id, {
          ...svg,
          data: svg.data || svg.component.defaultData,
        });
      }
      return { value };
    }
    case 'remove': {
      const svgId = payload.svgId;
      if (!value.has(svgId)) return svgs;
      value.delete(svgId);
      return { value };
    }
    case 'update': {
      const { svgId, data, style } = action.payload;
      const svg = value.get(svgId);
      if (svg) {
        svg.data = data;
        svg.style = style;
        return { value };
      } else {
        return svgs;
      }
    }
    case 'clear': {
      return { value };
    }
  }
};

export const ReactSVGOverlayApp = React.memo((props: { server: ReactSVGOverlayAppServer }) => {
  const { server } = props;
  const [svgComponents, dispatch] = useReducer(reducer, { value: new Map() });

  useEffect(() => {
    server.addComponent = (fc, id, model, data, style) => {
      return new Promise((r) => {
        dispatch({ type: 'add', payload: { component: fc, svgId: id, model, data, style } });
        server.queueAysncUpdate(id, r, 'add');
      });
    };

    // handle the initialization of items added before this React App working.
    if (server.svgToAdd?.length > 0) {
      setTimeout(() => {
        dispatch({
          type: 'init',
          payload: server.svgToAdd,
        });
        server.svgToAdd = null;
      }, 0);
    }

    server.removeComponent = (id) => dispatch({ type: 'remove', payload: { svgId: id } });

    server.clearComponents = () => dispatch({ type: 'clear' });

    server.updateComponent = (id: string, data: any, style: any) => {
      return new Promise((s) => {
        dispatch({ type: 'update', payload: { svgId: id, data, style } });
        server.queueAysncUpdate(id, s, 'update');
      });
    };

    server.isMounted = true;

    return () => {
      server.addComponent = null;
      server.removeComponent = null;
      server.clearComponents = null;
      server.updateComponent = null;
      server.isMounted = false;
    };
  }, []);

  // This effect may work hard
  useEffect(() => {
    /**
     * We must wait for the init dispatch happened.
     */
    if (server.svgToAdd) {
      return;
    }

    // Now it happens, let's settle down all the promises queued.
    server.clearQueuedAysncUpdates();
  }, [svgComponents]);

  const items = [...svgComponents.value.values()];

  return (
    <>
      {items.map((svg) => {
        const { size } = svg.model;

        const props = {
          id: svg.id,
          key: svg.id,
          model: svg.model,
          style: svg.style,
          sX: size.x,
          sY: size.y,
          a: svg.model.angle,
          svgType: svg.component.svgType,
          data: svg.data || svg.component.defaultData, // data on component is the default value.
        } as any;
        return React.createElement(svg.component, props);
      })}
    </>
  );
});

export { ReactSVGOverlayAppServer };
