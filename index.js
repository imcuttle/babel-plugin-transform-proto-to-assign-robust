/**
 * @file index
 * @author imcuttle
 * @description
 */

const pull = require('lodash.pull')
const tpl = require('babel-template')

const newDefault = tpl(`
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
  })(OBJ, DEFAULT)
`)

module.exports = function({ types: t }) {
  function isProtoKey(node) {
    return t.isLiteral(t.toComputedKey(node, node.key), { value: '__proto__' })
  }

  function isProtoAssignmentExpression(node) {
    const left = node.left
    return (
      t.isMemberExpression(left) &&
      t.isLiteral(t.toComputedKey(left, left.property), { value: '__proto__' })
    )
  }

  function buildDefaultsCallExpression(expr, ref, file) {
    // console.log(newDefault())
    // file.file.scope.registerDeclaration(newDefault().expression)
    // console.log(file.file.declarations)

    return newDefault({
      OBJ: ref,
      DEFAULT: expr.right
    })
  }

  return {
    visitor: {
      AssignmentExpression(path, file) {
        if (!isProtoAssignmentExpression(path.node)) return

        const nodes = []
        const left = path.node.left.object
        const temp = path.scope.maybeGenerateMemoised(left)

        if (temp)
          nodes.push(
            t.expressionStatement(t.assignmentExpression('=', temp, left))
          )
        nodes.push(buildDefaultsCallExpression(path.node, temp || left, file))
        if (temp) nodes.push(temp)

        path.replaceWithMultiple(nodes)
      },

      ExpressionStatement(path, file) {
        const expr = path.node.expression
        if (!t.isAssignmentExpression(expr, { operator: '=' })) return

        if (isProtoAssignmentExpression(expr)) {
          path.replaceWith(
            buildDefaultsCallExpression(expr, expr.left.object, file)
          )
        }
      },

      ObjectExpression(path, file) {
        let proto
        const { node } = path

        for (const prop of node.properties) {
          if (isProtoKey(prop)) {
            proto = prop.value
            pull(node.properties, prop)
          }
        }

        if (proto) {
          const args = [t.objectExpression([]), proto]
          if (node.properties.length) args.push(node)
          path.replaceWith(t.callExpression(file.addHelper('extends'), args))
        }
      }
    }
  }
}
