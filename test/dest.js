/**
 * @file source
 * @author Cuttle Cong
 * @date 2018/8/19
 */
const assert = require('assert');
let ref = Symbol('abc');
function Parent() {}
Parent[ref] = '123';
Parent.abc = '456';

function Son() {}

(function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  if (typeof Object.getOwnPropertySymbols === 'function') {
    keys = keys.concat(Object.getOwnPropertySymbols(defaults));
  }

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
})(Son, Parent);

assert(Son[ref] === Parent[ref]);
assert(Son['abc'] === Parent['abc']);
