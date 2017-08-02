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

// Save logs for the end.
const logs = [];

remote.config({

  // Silence npm-remote-ls messages until the end.
  logger: {
    log: function() {
      logs.push(_.toArray(arguments).join(' '));
    }
  },

  // We want _all_ dependencies.
  development: true,
  optional: true,
  peer: true
});

const stats = {
  count: 0,
  detected: 0,
  start: Date.now()
};

console.log('Auditing...');

Promise.all(manifest.filter(item => typeof item === 'string').map(item => {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    remote.ls(item, 'latest', true, function(result) {
      result = _.uniq(result.filter(v => typeof v === 'string').map(v => v.split('@')[0]));

      const time = Date.now() - start;
      const name = `| ${item} |`;
      const bar = '-'.repeat(name.length);
      const detected = result.filter(v => malicious.indexOf(v) !== -1);

      stats.count += result.length;
      stats.detected += detected;

      console.log([
        bar,
        name,
        bar,
        `Audited ${result.length} packages.`,
        `Completed in ${time / 1000} seconds.`,
        `Found ${detected.length} malicious packages in the tree!`
      ].concat(detected.map(v => `- ${v}`)).join(os.EOL));

      resolve();
    });
  });
})).then(results => {
  if (logs.length) {
    logs.unshift('= ERRORS =' + ('='.repeat(30)));
  }

  const output = logs
    .concat([
      '= SUMMARY =' + ('='.repeat(29)),
      `Audited ${stats.count} total packages.`,
      `Completed audit in ${(Date.now() - stats.start) / 1000} seconds.`,
      `Found a total of ${stats.detected} malicious packages!`
    ]);

  console.log(output.join(os.EOL));
});
