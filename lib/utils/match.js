var fspath = require("path");

/*
 * Match a tree against a string, regex, or custom function. A custom function
 * should accept a tree as its first argument and return a boolean value.
 *
 *   string:   returns true if the path contains the string
 *   regex:    returns true if the path matches the regex
 *   function: returns true if the function returns true
 */
module.exports = function(tree, query) {
  // Custom function
  if (typeof query === "function") {
    return query(tree);
  }

  var filename = fspath.basename(tree.path());

  // Check for sub string
  if (typeof query === "string") {
    return filename.indexOf(query) !== -1;
  }

  // Assume regex
  return query.test(filename);
};
