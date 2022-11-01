import * as THREE from 'three';
import { GraphicObject } from '../interfaces/GraghicObject';
import { IList } from '../model/basic';

export class Object3DList<M extends GraphicObject> implements IList<M> {
  items: Set<M>;
  index: Map<string, M>;
  size: number;

  add(item: M): void {
    throw new Error('Method not implemented.');
  }

  addRange(...items: M[]): void {
    throw new Error('Method not implemented.');
  }

  addArr(items: M[]): void {
    throw new Error('Method not implemented.');
  }

  remove(item?: M): void {
    throw new Error('Method not implemented.');
  }
  removeById(id: string): void {
    throw new Error('Method not implemented.');
  }
  removeRange(...items: M[]): void {
    throw new Error('Method not implemented.');
  }
  removeArr(items: M[]): void {
    throw new Error('Method not implemented.');
  }
  clear(): void {
    throw new Error('Method not implemented.');
  }
  update(item: M): void {
    throw new Error('Method not implemented.');
  }
  updateRange(...items: M[]): void {
    throw new Error('Method not implemented.');
  }
  has(key: string | M): boolean {
    throw new Error('Method not implemented.');
  }
  find(key: string): M {
    throw new Error('Method not implemented.');
  }
  query(predicate: (item: M) => boolean): M[] {
    throw new Error('Method not implemented.');
  }
  map<R>(project: (item: M) => R): R[] {
    throw new Error('Method not implemented.');
  }
  filter(pipe: (m: M) => boolean): M[] {
    throw new Error('Method not implemented.');
  }
  create(...args: any[]): M {
    throw new Error('Method not implemented.');
  }
  [Symbol.iterator](): Iterator<M, any, undefined> {
    throw new Error('Method not implemented.');
  }
}
