var fs = require("fs");
var fspath = require("path");
var assert = require("assert");

var walk = require("./utils/walk");

/**
 * A tree node.
 *
 * Represents either a directory or a file on the filesystem.
 */
var Tree = function(path, parent) {
  this._path = path;
  this._parent = parent || null;
  this._children = [];
  this._contents = null;
  this._isDirectory = null;
};

/**
 * Recursively builds a tree of Tree objects that represents the filesystem,
 * starting from `this.path()`.
 */
Tree.prototype.populate = function() {
  if (this.isDirectory()) {
    var files = fs.readdirSync(this._path);
    var children = [];

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      var path = fspath.join(this._path, file);
      var tree = new Tree(path, this);
      tree.populate();
      this._children.push(tree);
    }
  }

  return this;
};

Tree.prototype.path = function() {
  return this._path;
};

Tree.prototype.setPath = function(path) {
  this._path = path;
};

Tree.prototype.isDirectory = function() {
  if (this._isDirectory === null) {
    var stat = fs.statSync(this._path);
    this._isDirectory = stat.isDirectory();
  }

  return this._isDirectory;
};

Tree.prototype.isFile = function() {
  return !this.isDirectory();
};

Tree.prototype.hasParent = function() {
  return this.parent !== null;
};

Tree.prototype.parent = function() {
  return this._parent;
};

Tree.prototype.hasChildren = function() {
  return this._children !== null && this._children.length > 0;
};

Tree.prototype.children = function() {
  return this._children;
};

Tree.prototype.contents = function() {
  if (this._contents === null && this.isFile()) {
    this._contents = fs.readFileSync(this._path);
  }

  return this._contents;
};

Tree.prototype.setContents = function(contents) {
  assert(this.isFile(), "Cannot set contents on a directory.");

  if (typeof contents === "string") {
    contents = new Buffer(contents);
  }

  this._contents = contents;
};

Tree.prototype.remove = function() {
  assert(this._parent, "Tree item does not have a parent to be removed from.");

  var siblings = this.parent().children();
  this.parent = null;

  var index = siblings.indexOf(this);
  siblings.splice(index, 1);
};

Tree.prototype.walk = function(fn) {
  walk(this, fn);
};

Tree.prototype.items = function() {
  var items = [this];

  this.walk(function(item){
    items.push(item);
  });

  return items;
};

Tree.prototype.all = function(fn) {
  var items = this.items();

  for (var i = items.length - 1; i >= 0; i--) {
    var item = items[i];
    fn(item);
  }

  return this;
};

Tree.prototype.filter = function(regex, fn) {
  var items = this.items();

  for (var i = items.length - 1; i >= 0; i--) {
    var item = items[i];

    if (regex.test(fspath.basename(item.path()))) {
      fn(item);
    }
  }

  return this;
};

Tree.prototype.pipe = function(plugin) {
  plugin(this);
  return this;
};

module.exports = Tree;
