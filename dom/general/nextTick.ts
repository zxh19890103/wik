type NextTick = () => void;

// eslint-disable-next-line prefer-const
let $nextTick: NextTick = () => {};

export { $nextTick };
