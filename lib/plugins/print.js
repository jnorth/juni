var fspath = require("path");

/**
 * Print a tree to the console.
 *
 * Useful for debugging.
 */
var print = function(tree, indent, indentString) {
  indent = indent || 0;
  indentString = indentString || "  ";

  // Generate indentation prefix
  var prefix = "";

  for (var i = 0; i < indent; i++) {
    prefix += indentString;
  }

  // Print children
  if (tree.hasChildren()) {
    var children = tree.children();

    for (var i = 0; i < children.length; i++) {
      console.log(prefix + fspath.basename(children[i].path()));
      print(children[i], indent + 1, indentString);
    }
  }
};

module.exports = function(indent, indentString) {
  return function(tree) {
    print(tree, indent, indentString);
  }
};
