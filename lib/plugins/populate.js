var fs = require("fs");
var fspath = require("path");

var juniTree = require("../tree");

/**
 * Recursively builds a tree containing filesystem items in the current tree's
 * path. You basically always want to call this after creating a new tree.
 */
var populate = function(tree) {
  if (tree.isDirectory()) {
    var files = fs.readdirSync(tree.path());

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var path = fspath.join(tree.path(), file);
      var child = new juniTree(path, tree);
      child.pipe(populate);
      tree.addChild(child);
    };
  }
};

module.exports = function() {
  return function(tree) {
    populate(tree);
    return tree;
  }
};
