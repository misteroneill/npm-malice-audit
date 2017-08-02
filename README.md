# npm-malice-audit

Audits npm packages for any known-malicious package names.

## Installation

```
npm install npm-malice-audit -g
```

## Usage

This is a CLI tool, so it is invoked from the command line. You must provide a manifest of packages in an `npm-malice-audit.json` file with contents like this:

```js
[
  "foo",
  "bar"
]
```

Each item in the array is a package you whose dependency tree you wish to inspect.

Then, calling `npm-malice-audit` in the same directory will inspect each of these packages and produce a report to stdout.
