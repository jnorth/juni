# Juni

**A tree-based build system.**

Juni is a simple build system that acts on filesystem trees. Plugins are then
applied to the tree, and manipulate it in-place.

## Example Usage

Juni does not come with a CLI tool, or require you to have a special `*file.js`
in your project folder. Just write your own build script and run it how you
like.

```js
var juni = require("juni");

// Use plugins
// This one writes the tree to a new path
var output = require("juni-output");

// Writing plugins is easy
var removeFiles = function(regex) {
  return function(tree) {
    tree.filter(regex, function(item){
      item.remove();
    });
  };
};

// Use other libraries in your plugins
var coffee = require("coffee");
var juniCoffee = function() {
  return function(tree) {
    // Get all coffee script files
    tree.filter(/\.coffee$/, function(item){
      // Get file contents
      var contents = item.contents().toString();

      // Compile contents
      var compiled = coffee.compile(contents);

      // Replace file's contents
      item.setContents(compiled);

      // Rename file
      item.setPath(item.path().replace(".coffee", ".js"));
    });
  };
};

// Then populate a tree and run plugins on it
new juni.tree(sourcePath)
  .populate()
  .pipe(removeFiles(/^\.DS_Store/))
  .pipe(juniCoffee())
  .pipe(output(destPath));
```

## Trees

Juni's foundation is built on the `Tree` class. A `Tree` item represents either
a file or folder on the filesystem.

`Tree`

`Tree.populate()` — Recursively builds a tree containing filesystem items in the
current tree's path. You basically just need to call this after creating a new
tree.

`Tree.path()` — Get the absolute path to the tree. This is typically the value
that was set in the constructor, though plugins can change it.

`Tree.setPath(newPath)` — Set the absolute path to the tree on the filesystem.

`Tree.isDirectory()` — Returns true if the tree is a directory.

`Tree.isFile()` — Returns true if the tree is a file.

`Tree.hasParent()` — Returns true if the tree has a parent tree. Will be false
for the root tree.

`Tree.parent()` — Returns the parent tree, or `null` if it has none.

`Tree.hasChildren()` — Returns true if the tree has child trees. Will be false
for files and empty directories.

`Tree.children()` — Returns an array of child trees.

`Tree.contents()` — Returns a tree's file contents, either as a string or a
buffer. Only makes sense for `isFile` trees.

`Tree.setContents(newContents)` — Set a tree's file contents.

`Tree.remove()` — Removes a tree from its parent tree.

`Tree.walk(fn)` — Call a function `fn(tree)` for each item in the tree. This
iterates in-place, so be careful when modifying the tree.

`Tree.items()` — Returns an array of all tree items. This provides a safe way to
modify the tree.

`Tree.all(fn)` — Call a function `fn(tree)` for each item in the tree.

`Tree.filter(regex, fn)` — Call a function `fn(tree)` for each item whos path
basename matches the `regex`.

`Tree.pipe(transform)` — Pass the tree through a transform function.

## Writing Plugins

The `Tree.pipe` method expects a function that accepts a `Tree` object. The
return value doesn't matter. We call this a `transform` function.

Typically a plugin might want to accept options or other input though, so by
convention, a juni plugin is a function that accepts any arguments and returns a
transform function. An example makes this clearer:

```js
// Here is a simple transform function that will append some text to all files
// in a juni tree.
var appender = function(tree) {
  tree.all(function(item){
    if (item.isFile()) {
      item.setContents(item.contents().toString() + "Appender was here!");
    }
  });
};

tree.pipe(appender);

// This would be much more useful if we could specifiy the text to append.
// Let's make a simple plugin
var appender = function(appendString) {
  // Return a transform function
  return function(tree) {
    tree.all(function(item){
      if (item.isFile()) {
        item.setContents(item.contents().toString() + appendString);
      }
    });
  };
};

// Our appender plugin is now a plugin--it has to be called before it is passed
// to `Tree.pipe`.
var dateAppender = appender(new Date());
tree.pipe(dateAppender);

// or simply
tree.pipe(appender(new Date()));
```
