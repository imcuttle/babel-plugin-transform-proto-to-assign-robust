/**
 * @file source
 * @author Cuttle Cong
 * @date 2018/8/19
 */
const assert = require('assert')
let ref = Symbol('abc')
function Parent() {}
Parent[ref] = '123'
Parent.abc = '456'

function Son() {}
Son.__proto__ = Parent

assert(Son[ref] === Parent[ref])
assert(Son['abc'] === Parent['abc'])
