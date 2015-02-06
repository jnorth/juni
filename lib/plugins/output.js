var fs = require("fs");
var fspath = require("path");

var walker = require("../walkers/pre");

/**
 * A Juni plugin.
 *
 * Writes a tree to the filesystem.
 */
module.exports = function(dest) {
  return function(tree) {
    var root = tree.path();
    fs.mkdirSync(dest);

    tree.walk(walker(function(item){
      var rel = fspath.relative(root, item.path());
      var d = fspath.join(dest, rel);

      if (item.isDirectory()) {
        fs.mkdirSync(d);
      } else {
        fs.writeFileSync(d, item.contents());
      }
    }));
  };
};
