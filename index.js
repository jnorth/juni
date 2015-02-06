module.exports = {
  Tree: require("./lib/tree"),

  // Bundled plugins
  populate: require("./lib/plugins/populate"),
  print: require("./lib/plugins/print"),
  output: require("./lib/plugins/output"),

  // Bundled walkers
  walk: {
    pre: require("./lib/walkers/pre"),
    post: require("./lib/walkers/post")
  },

  // Bundled matchers
  match: {
    any: require("./lib/matchers/any"),
    all: require("./lib/matchers/all")
  }
};
