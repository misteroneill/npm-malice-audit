# npm-malice-audit

Audits npm packages for any known-malicious package names.

## Installation

```
npm install npm-malice-audit -g
```

## Usage

This is a CLI tool, so it is invoked from the command line.

You must provide a manifest of packages. A manifest is an array of npm package names and can be provided in two ways:

### npm-malice-audit.json

> Use this if you want to check multiple packages without installing them.

First, the tool will look for an `npm-malice-audit.json` file with contents like this:

```js
[
  "foo",
  "bar"
]
```

### package.json

> Use this if you want to check the dependencies of a project you have installed/cloned locally.

Second, the tool will look for a `package.json` file and use all of its `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies` as the package manifest.

## Report

If a non-empty manifest is found, a report similar to the following will be produced:

```sh
$ npm-malice-audit
Auditing...
----------
| lodash |
----------
Completed in 0.217 seconds.
Found 0 malicious packages in the tree!
-----------------
| npm-remote-ls |
-----------------
Completed in 7.121 seconds.
Found 0 malicious packages in the tree!
======================================
Audited 2 total packages.
Completed audit in 7.141 seconds.
Found a total of 0 malicious packages!
```

**Note:** Large packages with many dependencies can take a _long_ time to resolve due to the need for _many_ requests - patience is a virtue!
