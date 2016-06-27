# continuation-local-storage support for bluebird promises

[![NPM version](https://img.shields.io/npm/v/cls-bluebird.svg)](https://www.npmjs.com/package/cls-bluebird)
[![Build Status](https://img.shields.io/travis/TimBeyer/cls-bluebird/master.svg)](http://travis-ci.org/TimBeyer/cls-bluebird)
[![Dependency Status](https://img.shields.io/david/TimBeyer/cls-bluebird.svg)](https://david-dm.org/TimBeyer/cls-bluebird)
[![Dev dependency Status](https://img.shields.io/david/dev/TimBeyer/cls-bluebird.svg)](https://david-dm.org/TimBeyer/cls-bluebird)
[![Coverage Status](https://img.shields.io/coveralls/TimBeyer/cls-bluebird/master.svg)](https://coveralls.io/r/TimBeyer/cls-bluebird)

Patch [bluebird](https://www.npmjs.com/package/bluebird) for [continuation-local-storage](https://www.npmjs.com/package/continuation-local-storage) support.

## Current Status

Compatible with [bluebird](https://www.npmjs.com/package/bluebird) v2.x and v3.x. Tests cover both versions.

## Usage

### `clsBluebird( ns [, Promise] )`

```js
var cls = require('continuation-local-storage');
var ns = cls.createNamespace('myNamespace');

var Promise = require('bluebird');
var clsBluebird = require('cls-bluebird');

clsBluebird( ns );
// Promise is now patched to maintain CLS context
```

The above patches the "global" instance of bluebird. So anywhere else in the same app that calls `require('bluebird')` will get the patched version (assuming npm resolves to the same file).

### Patching a particular instance of Bluebird

To patch a particular instance of bluebird:

```js
var Promise = require('bluebird');
var clsBluebird = require('cls-bluebird');

clsBluebird( ns, Promise );
```

This is a more robust approach.

### Nature of patching

Combining CLS and promises is a slightly tricky business. There are 3 different conventions one could use (see [this issue](https://github.com/TimBeyer/cls-bluebird/issues/6) for more detail).

`cls-bluebird` follows the convention of binding `.then()` callbacks **to the context in which `.then()` is called**.

```js
var promise;
ns.run(function() {
    ns.set('foo', 123);
    promise = Promise.resolve();
});

ns.run(function() {
    ns.set('foo', 456);
    promise.then(print);
});

function print() {
    console.log(ns.get('foo'));
}

// this outputs '456' (the value of `foo` at the time `.then()` was called)
```

### Global error handlers

`Promise.onPossiblyUnhandledRejection()` and `Promise.onUnhandledRejectionHandled()` allow you to attach global handlers to intercept unhandled rejections.

The CLS context in which callbacks are called is unknown. It's probably unwise to rely on the CLS context in the callback being that when the rejection occurred - use `.catch()` on the end of the promise chain that's created within `namespace.run()` instead.

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See [changelog.md](https://github.com/TimBeyer/cls-bluebird/blob/master/changelog.md)

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/TimBeyer/cls-bluebird/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add an entry to changelog
* add tests for new features
* document new functionality/API additions in README
