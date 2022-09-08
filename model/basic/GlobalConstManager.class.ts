export class GlobalConstManager {
  rotationFreq = 20; // 1/60 s PER unit deg
  translationFreq = 0.4; // 1/60 s PER unit mm.

  getVal(k: string, defaultVal = null) {
    return this[k] || defaultVal;
  }

  setVal(k: string, v: any) {
    this[k] = v;
  }
}
