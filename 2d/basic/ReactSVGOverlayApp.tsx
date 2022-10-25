import React, { useEffect, useReducer } from 'react';
import ReactDOM from 'react-dom';
import { BUILTIN_LEAFLET_PANES } from './constants';
import { HrMap } from './Map.class';
import { SvgFunctionComponent } from './SVGComponentFactory';

interface SVG {
  id: string;
  component: SvgFunctionComponent;
  data?: any;
  style?: React.CSSProperties;
  model?: any;
}

type SVGPool = { value: Map<string, SVG> };
type SVGPoolAction = { type: 'init' | 'add' | 'remove' | 'update' | 'clear'; payload?: any };
type AfterRenderPromiseSettleFn = (val?: HTMLElement) => void;

/**
 * 用于渲染 svg 组件的服务
 */
class ReactSVGOverlayAppServer {
  map: HrMap;
  pane: string;
  isRunning = false;
  isMounted = false;

  paneElement: HTMLDivElement;
  leafletPanesElement: HTMLDivElement;
  svgToAdd: SVG[] = null;

  settleAfterRenderPromisesQueue: Map<string, AfterRenderPromiseSettleFn> = new Map();

  addComponent: (
    component: SvgFunctionComponent,
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

  /**
   *  将 server 挂载于 map 上，并且指定一个 pane
   *
   * 注意：当使用这样的服务时，你就不能使用 vector 渲染方式
   */
  bootstrap(map: HrMap, pane: string) {
    if (this.isRunning) {
      return this;
    }

    if (!__PROD__) {
      if (BUILTIN_LEAFLET_PANES.indexOf(pane) !== -1) {
        throw new Error(
          `You should not use the built-in panes in svg server, which includes: ${BUILTIN_LEAFLET_PANES}`,
        );
      }
    }

    this.pane = pane;
    this.map = map;

    this.addComponent = async (...args: any) => {
      if (!this.svgToAdd) this.svgToAdd = [];

      return new Promise((r) => {
        this.svgToAdd.push({
          id: args[1],
          component: args[0],
          model: args[2],
          data: args[3],
          style: args[4],
        });

        this.settleAfterRenderPromisesQueue.set(args[1], r);
      });
    };

    this.preparePaneElement();
    ReactDOM.render(<ReactSVGOverlayApp server={this} />, this.paneElement);

    this.isRunning = true;
    return this;
  }

  private preparePaneElement() {
    this.leafletPanesElement = this.map._container.querySelector('.leaflet-map-pane');
    this.paneElement = this.leafletPanesElement.querySelector(
      `.leaflet-${this.pane.replace('Pane', '-pane')}`,
    ) as HTMLDivElement;
  }

  teardown() {
    if (!this.isRunning) return;
    if (this.clearComponents) {
      this.clearComponents();
    }
    try {
      this.leafletPanesElement = null;
      this.paneElement = null;
      this.map = null;
      this.isRunning = false;
      this.isMounted = false;
    } catch (e) {
      if (!__PROD__) {
        window.location.reload();
      }
    }
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
        server.settleAfterRenderPromisesQueue.set(id, r);
      });
    };

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
        server.settleAfterRenderPromisesQueue.set(id, s);
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
  }, [server]);

  useEffect(() => {
    if (server.svgToAdd) return;
    if (server.settleAfterRenderPromisesQueue.size > 0) {
      for (const [svgId, promiseSettle] of server.settleAfterRenderPromisesQueue) {
        promiseSettle(server.getSVGElement(svgId));
      }
      server.settleAfterRenderPromisesQueue.clear();
    }
  }, [svgComponents, server]);

  const items = [...svgComponents.value.values()];

  return (
    <>
      {items.map((svg) => {
        const props = {
          id: svg.id,
          key: svg.id,
          model: svg.model,
          style: svg.style,
          svgType: svg.component.svgType,
          data: svg.data || svg.component.defaultData, // data on component is the default value.
        } as any;
        return React.createElement(svg.component, props);
      })}
    </>
  );
});

export { ReactSVGOverlayAppServer };
