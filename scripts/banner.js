const { version } = require('../package.json');

module.exports = function () {
  return `

/*!
 * Wik ${version}
 * https://wik.zhangxinghai.cn/
 *
 * Copyright 2023-present Sea Zhang
 * Released under the MIT license
 *
 * Date: ${new Date().toUTCString()}
 */

    `;
};
