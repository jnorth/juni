# Juni

**A tree-based build system.**

Juni is a simple build system that acts on file system trees. Plugins are then
applied to the tree, and manipulate it in-place.

## Example Usage

Juni does not come with a CLI tool, or require you to have a special `*file.js`
in your project folder. Just write your own build script and run it how you
like.

```javascript
var juni = require("juni");

new juni.Tree("./source")
  .pipe(juni.populate())
  // Call more plugins ...
  .pipe(juni.output("./build"));
```

## Trees

Juni is based around the `Tree` class. A `Tree` instance represents either a
file or folder on the file system. Typically a plugin will take a tree and
modify, remove, or add children to it.

##### `Tree.path()`

Get the path to the tree. This is typically the value that was set in the
constructor, though plugins can change it.

##### `Tree.setPath(path)`

Set the path to the tree on the file system.

##### `Tree.isDirectory()`

Returns true if the tree is a directory.

##### `Tree.isFile()`

Returns true if the tree is a file.

##### `Tree.hasParent()`

Returns true if the tree has a parent tree. Will be false for the root tree.

##### `Tree.parent()`

Returns the parent tree, or `null` if it has none.

##### `Tree.hasChildren()`

Returns true if the tree has child trees. Will be false for files and empty
directories.

##### `Tree.children()`

Returns an array of child trees.

##### `Tree.contents()`

Returns a tree's file contents as a buffer. Only makes sense for file trees.

##### `Tree.setContents(contents)`

Set a tree's file contents. `contents` should be a buffer or a string. Strings
will be automatically converted to a buffer.

##### `Tree.remove()`

Removes a tree from its parent tree.

##### `Tree.addChild()`

Adds a child tree to a tree.

##### `Tree.walk(walker)`

Traverses the tree using a walker. See "Walking" below.

##### `Tree.match(matcher)`

Returns true if the tree matches the matcher. See "Matching" below.

##### `Tree.pipe(transform)`

Pass the tree through a transform function. Transform functions are typically
returned by plugins. See "Plugins" below.

## Walking

In a tree-based build system, being able to traverse trees easily and in custom
ways is super important. The `Tree.walk` method traverses a tree using `walkers`.

Walkers are just functions. They accept a tree and a function, and call the
function with each tree node it visits. Which nodes it visits, and in what order
are up the the walker.

Walkers can also return a value, making them a powerful way to extract nodes
from the tree or compute values based on the tree.

If that sounds complicated, don't worry. You really only need to use walkers
when building plugins, and even then you can probably just use the walkers
bundled along with Juni.

### Bundled Walkers

#### `juni.walk.pre`

Visit each item in the tree with a pre-order traversal.

This traversal ensures that all parent nodes will be visited before their
children. Useful for copying the tree, for example to the file system.

Example usage:

```javascript
var juni = require("juni");

var tree = new juni.tree("/my/path")
  .pipe(populate());

tree.walk(juni.walk.pre(function(item)){
  console.log(item.path());
});
```

A folder stucture like:

```
/my/path/scripts
/my/path/scripts/app.coffee
/my/path/scripts/main.js
/my/path/scripts/vendor
/my/path/scripts/vendor/jquery.js
```

will output:

```
/my/path/scripts
/my/path/scripts/app.coffee
/my/path/scripts/main.js
/my/path/scripts/vendor
/my/path/scripts/vendor/jquery.js
```

#### `juni.walk.post`

Visit each item in the tree with a post-order traversal.

This traversal ensures that all children nodes will be visited before their
parents. Useful when removing nodes from the tree.

Example usage:

```javascript
var juni = require("juni");

var tree = new juni.tree("/my/path")
  .pipe(populate());

tree.walk(juni.walk.post(function(item)){
  console.log(item.path());
});
```

A folder stucture like:

```
/my/path/scripts
/my/path/scripts/app.coffee
/my/path/scripts/main.js
/my/path/scripts/vendor
/my/path/scripts/vendor/jquery.js
```

will output:

```
/my/path/scripts/vendor/jquery.js
/my/path/scripts/vendor
/my/path/scripts/main.js
/my/path/scripts/app.coffee
/my/path/scripts
```

## Matching

Matchers can be used to see if a tree node matches some specific queries. For
example you can check if the filename contains "foo", or see if the modified
date is over a day ago.

The `Tree.match` method uses `matchers` to decide if it returns true or false.
Similar to walkers, matchers are just functions. They accept a tree and return
true or false.

### Bundled Matchers

The matchers that come bundled with Juni all accept a `query`, which is a
string, regex, function, or an array of those. Strings and regular expressions
are used to match against the tree filename.

If you want to match against something else, you can pass in your own function.
A tree node is passed in and you can return true or false based on that.

#### `juni.match.any`

Returns true if any query matches the tree node.

```javascript
var match = tree.match(juni.match.any(["foo", /^_/]));

// tree.path() == "foolhardy" => true
// tree.path() == "_sadpanda" => true
// tree.path() == "banana stand" => false
```

#### `juni.match.all`

Returns true if all queries match the tree node.

```javascript
var match = tree.match(juni.match.all(["foo", /^_/]));

// tree.path() == "foolhardy" => false
// tree.path() == "_sadpanda" => false
// tree.path() == "banana stand" => false
// tree.path() == "_eatfood" => true
```

### Query Functions

If just matching against the filename isn't enough, you can pass a function to
the bundled matchers:

```javascript
var inFooPathQuery = function(tree) {
  return tree.path().indexOf("foo/") !== -1;
};

tree.match(juni.match.all(inFooPathQuery));
```

## Plugins

Juni plugins are used with the `Tree.pipe` method.

### Bundled Plugins

#### `juni.populate`

Recursively builds a tree containing file system items in the current tree's
path. You basically always want to call this after creating a new tree.

```javascript
var tree = new juni.Tree("/my/path");
tree.hasChildren() // => false

tree.pipe(juni.populate());
tree.hasChildren() // => true
```

#### `juni.print`

Prints a tree to the console. Useful for debugging.

#### `juni.output(dest)`

Writes the tree to the file system at the `dest` path.

```javascript
// Copy all files from source to build
new juni.Tree("./source")
  .pipe(populate())
  .pipe(output("./build"));
```

### Building a Plugin

The `Tree.pipe` method expects a function that accepts a `Tree` object. The
return value doesn't matter. We call this a `transform` function.

Typically a plugin might want to accept options or other input though, so by
convention, a Juni plugin is a function that accepts any arguments and returns a
transform function. An example makes this clearer:

```javascript
// Here is a simple transform function that will append some text to all files
// in a juni tree.
var appender = function(tree) {
  tree.walk(juni.walk.pre(function(item){
    if (item.isFile()) {
      var contents = item.contents().toString();
      item.setContents(contents + "Appender was here!");
    }
  }));
};

tree.pipe(appender);

// This would be much more useful if we could specifiy the text to append.
// Let's make a simple plugin
var appender = function(appendString) {
  // Return a transform function
  return function(tree) {
    tree.walk(juni.walk.pre(function(item){
      if (item.isFile()) {
        var contents = item.contents().toString();
        item.setContents(contents + appendString);
      }
    }));
  };
};

// Our appender plugin is now a plugin--it has to be called before it is passed
// to `Tree.pipe`.
var dateAppender = appender(new Date());
tree.pipe(dateAppender);

// or simply
tree.pipe(appender(new Date()));
```
