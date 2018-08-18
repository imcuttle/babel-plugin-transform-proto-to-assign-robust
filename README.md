# babel-plugin-transform-proto-to-assign-robust

[![build status](https://img.shields.io/travis/imcuttle/babel-plugin-transform-proto-to-assign-robust/master.svg?style=flat-square)](https://travis-ci.org/imcuttle/babel-plugin-transform-proto-to-assign-robust)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/babel-plugin-transform-proto-to-assign-robust.svg?style=flat-square)](https://codecov.io/github/imcuttle/babel-plugin-transform-proto-to-assign-robust?branch=master)
[![NPM version](https://img.shields.io/npm/v/babel-plugin-transform-proto-to-assign-robust.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-transform-proto-to-assign-robust)
[![NPM Downloads](https://img.shields.io/npm/dm/babel-plugin-transform-proto-to-assign-robust.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/babel-plugin-transform-proto-to-assign-robust)

This plugin allows Babel to transform all **proto** assignments to a method that will do a shallow copy of all properties with symbol.

Inspired by [`babel-plugin-transform-proto-to-assign`](https://github.com/babel/babel/tree/6.x/packages/babel-plugin-transform-proto-to-assign)

## Why?

When we using es6 class extend syntax in IE<=10 which has not `Object.setPrototypeOf` and `__proto__`, so We need use `babel-plugin-transform-proto-to-assign` to transforming.

- In

```javascript
bar.__proto__ = foo
```

- Out

```javascript
var _defaults = function(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var value = Object.getOwnPropertyDescriptor(defaults, key)
    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value)
    }
  }
  return obj
}

_defaults(bar, foo)
```

The above transform are worked by `babel-plugin-transform-proto-to-assign`.

However the `_default` function `DO NOT` assign the `Symbol` static value, but `babel-plugin-transform-proto-to-assign-robust` do it!

## Transform
- In
```javascript
bar.__proto__ = foo
```

- Out
```javascript
;(function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var value = Object.getOwnPropertyDescriptor(defaults, key)
    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value)
    }
  }
  return obj
})(bar, foo);
```

