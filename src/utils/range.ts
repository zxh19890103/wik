export default (n, iter: (i: number) => void) => {
  for (let i = 0; i < n; i++) {
    iter(i);
  }
};
