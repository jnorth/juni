/**
 * Visit each item in the tree with a post-order traversal.
 *
 * This traversal ensures that all children nodes will be visited before their
 * parents. Useful when removing nodes from the tree.
 *
 * Example usage:
 *
 * ```javascript
 * var juni = require("juni");
 *
 * var tree = new juni.tree("/my/path")
 *   .pipe(populate());
 *
 * tree.walk(juni.walk.post(function(item)){
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
 * /my/path/scripts/vendor/jquery.js
 * /my/path/scripts/vendor
 * /my/path/scripts/main.js
 * /my/path/scripts/app.coffee
 * /my/path/scripts
 * ```
 */
var walk = function(tree, fn) {
  if (!tree.hasChildren()) {
    return;
  }

  var children = tree.children();

  for (var i = children.length - 1; i >= 0; i--) {
    walk(children[i], fn);
    fn(children[i]);
  };
};

module.exports = function(fn) {
  return function(tree) {
    walk(tree, fn);
  };
};
