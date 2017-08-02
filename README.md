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

First, the tool will look for an `npm-malice-audit.json` file with contents like this:

```js
[
  "foo",
  "bar"
]
```

### package.json

Second, the tool will look for a `package.json` file and use all of its `dependencies`, `devDependencies`, `peerDependencies`, and `optionalDependencies` as the package manifest.

## Report

If a non-empty manifest is found, a report similar to the following will be produced:

```sh
$ npm-malice-audit
Auditing...
-------
| foo |
-------
Completed in 0.611 seconds.
Found 0 malicious packages in the tree!
-------
| bar |
-------
Completed in 129.604 seconds.
Found 0 malicious packages in the tree!
```

**Note:** Large packages with many dependencies can take a _long_ time to resolve due to the need for _many_ requests - patience is a virtue!
