import { IDisposable } from '../../interfaces/Disposable';
import { quequeTask } from '../../utils';
import { Base, View, WithID } from './Base.class';
import { IList, List } from './List.class';

export type ViewMake<M, V> = (m: M) => V;

interface ViewsOptions<M extends Base, V extends View<M>> {
  source: List<M>;
  make: (m: M) => V;
  views: IList<V>;
}

let id_seed = 1921;

export class Views<M extends Base, V extends View<M>> implements WithID, IDisposable {
  id: string = 'views_' + id_seed++;
  private source: List<M> = null;
  private records: Map<string, V> = new Map();
  private views: IList<V> = null;
  private viewMake: ViewMake<M, V> = null;

  constructor(private options: ViewsOptions<M, V>) {
    const { source, make } = this.options;
    this.source = source;
    this.viewMake = make;

    this.views = options.views || null;

    this.source.on('add', this.lazyRender, this);
    this.source.on('add.r', this.lazyRender, this);
    this.source.on('remove', this.lazyRender, this);
    this.source.on('remove.r', this.lazyRender, this);

    this.render();
  }

  private diff() {
    const adds: string[] = [];
    const deletes: string[] = [];

    for (const item of this.source.items) {
      if (this.records.has(item.id)) continue;
      adds.push(item.id);
    }

    for (const [id, v] of this.records) {
      if (this.source.index.has(id)) continue;
      deletes.push(id);
    }

    return [adds, deletes];
  }

  private lazyRender() {
    quequeTask({ run: this.render, context: this, key: this.id });
  }

  private render() {
    const [newids, removals] = this.diff();

    // which is added
    const adds = newids.map((id) => {
      const m = this.source.find(id);
      const v = this.viewMake(m);
      bindModelView(v, m);
      this.records.set(m.id, v);
      return v;
    });

    this.views.addArr(adds);

    const trash = this.source.getTrash();

    // which is deleted.
    const deleteds = removals.map((id) => {
      const m = trash.get(id);
      const v = this.records.get(id);
      unbindModelView(v, m);
      this.records.delete(m.id);
      return v;
    });

    this.views.removeArr(deleteds);
  }

  dispose(): void {
    this.source.off('add', this.render);
    this.source.off('add.r', this.render);
    this.source.off('remove', this.render);
    this.source.off('remove.r', this.render);
  }
}

function bindModelView<M extends Base, V extends View<M>>(v: V, m: M) {
  v.model = m;
  m.$$views.push(v);
  v.whenInit();
}

function unbindModelView<M extends Base, V extends View<M>>(v: V, m: M) {
  v.model = null;
  const i = m.$$views.indexOf(v);
  m.$$views.splice(i, 1);
}
