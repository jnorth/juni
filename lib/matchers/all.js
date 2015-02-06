var match = require("../utils/match");

/**
 * Returns true if the tree matches all query items.
 */
var matchAll = function(tree, query) {
  if (!Array.isArray(query)) {
    return match(tree, query);
  }

  for (var i = 0; i < query.length; i++) {
    if (!match(tree, query[i])) {
      return false;
    }
  }

  return true;
};

module.exports = function(query) {
  return function(tree) {
    return matchAll(tree, query);
  };
};
