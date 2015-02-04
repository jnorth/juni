/**
 * Walk all tree nodes recursively.
 */
var walk = function(tree, fn) {
  if (!tree.hasChildren()) {
    return;
  }

  var children = tree.children();

  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    fn(child);

    if (child.hasChildren()) {
      walk(child, fn);
    }
  }
};

module.exports = walk;
