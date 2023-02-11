export const createOffscreenCanvas = (img: HTMLImageElement, scale: number) => {
  const canvas = document.createElement('canvas');

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const dW = w * scale;
  const dH = h * scale;

  canvas.width = w;
  canvas.height = h;

  canvas.width = dW * devicePixelRatio;
  canvas.height = dH * devicePixelRatio;

  canvas.style.width = dW + 'px';
  canvas.style.height = dH + 'px';

  const ctx = canvas.getContext('2d');

  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.drawImage(img, 0, 0, w, h, 0, 0, dW, dH);

  return canvas;
};
