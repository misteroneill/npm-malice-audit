#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const os = require('os');
const path = require('path');
const remote = require('npm-remote-ls');
const malicious = require('./malicious.json');

let manifest;

try {
  manifest = require(path.resolve(process.cwd(), 'npm-malice-audit.json'));
} catch (x) {
  try {
    const pkg = require(path.resolve(process.cwd(), 'package.json'));

    manifest = _.uniq(
      Object.keys(pkg.dependencies || {})
        .concat(Object.keys(pkg.devDependencies || {}))
        .concat(Object.keys(pkg.peerDependencies || {}))
        .concat(Object.keys(pkg.optionalDependencies || {}))
    );
  } catch (x) {
    console.error('No npm-malice-audit.json or package.json found! Please refer to the README for usage.');
    process.exit(1);
  }
}

if (!Array.isArray(manifest) || !manifest.length) {
  console.warn('No packages specified in either npm-malice-audit.json or package.json');
  process.exit(0);
}

remote.config({

  // We want _all_ dependencies.
  development: true,
  optional: true,
  peer: true
});

console.log('Auditing...');

manifest.filter(item => typeof item === 'string').forEach(item => {
  const start = Date.now();

  remote.ls(item, 'latest', function(result) {
    const flattened = _.uniq(
      _.flattenDeep(_.toPairs(result))
        .filter(v => typeof v === 'string')
        .map(v => v.split('@')[0])
    );

    const time = Date.now() - start;
    const name = `| ${item} |`;
    const bar = '-'.repeat(name.length);
    const detected = flattened.filter(v => malicious.indexOf(v) !== -1);

    console.log([
      bar,
      name,
      bar,
      `Completed in ${time / 1000} seconds.`,
      `Found ${detected.length} malicious packages in the tree!`
    ].concat(detected.map(v => `- ${v}`)).join(os.EOL));
  });
});
