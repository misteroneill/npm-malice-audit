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

```
$ npm-malice-audit
---------
| async |
---------
Audited 673 packages.
Completed in 79.481 seconds.
Found 0 malicious packages in the tree!
----------
| lodash |
----------
Audited 1 packages.
Completed in 0.202 seconds.
Found 0 malicious packages in the tree!
-----------------
| npm-remote-ls |
-----------------
Audited 405 packages.
Completed in 42.203 seconds.
Found 0 malicious packages in the tree!
= SUMMARY ==============================
Audited 1079 total packages.
Completed audit in 121.899 seconds.
Found a total of 0 malicious packages!
```

You may also see an `= ERRORS =` section above the `= SUMMARY =`. This includes messages logged when there are problems looking up packages.

**Note:** Large packages with many dependencies can take a _long_ time to resolve due to the need for _many_ requests - patience is a virtue!
