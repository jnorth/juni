var match = require("../utils/match");

/**
 * Returns true if the tree matches any query items.
 */
var matchAny = function(tree, query) {
  if (!Array.isArray(query)) {
    return match(tree, query);
  }

  for (var i = 0; i < query.length; i++) {
    if (match(tree, query[i])) {
      return true;
    }
  }

  return false;
};

module.exports = function(query) {
  return function(tree) {
    return matchAny(tree, query);
  };
};
