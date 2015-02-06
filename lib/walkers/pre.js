/**
 * Visit each item in the tree with a pre-order traversal.
 *
 * This traversal ensures that all parent nodes will be visited before their
 * children. Useful for copying the tree, for example to the file system.
 *
 * Example usage:
 *
 * ```javascript
 * var juni = require("juni");
 *
 * var tree = new juni.tree("/my/path")
 *   .pipe(populate());
 *
 * tree.walk(juni.walk.pre(function(item)){
 *   console.log(item.path());
 * });
 * ```
 *
 * A folder stucture like:
 *
 * ```
 * /my/path/scripts
 * /my/path/scripts/app.coffee
 * /my/path/scripts/main.js
 * /my/path/scripts/vendor
 * /my/path/scripts/vendor/jquery.js
 * ```
 *
 * will output:
 *
 * ```
 * /my/path/scripts
 * /my/path/scripts/app.coffee
 * /my/path/scripts/main.js
 * /my/path/scripts/vendor
 * /my/path/scripts/vendor/jquery.js
 * ```
 */
var walk = function(tree, fn) {
  if (!tree.hasChildren()) {
    return;
  }

  var children = tree.children();

  for (var i = 0; i < children.length; i++) {
    fn(children[i]);
    walk(children[i], fn);
  }
};

module.exports = function(fn) {
  return function(tree) {
    walk(tree, fn);
  };
};
