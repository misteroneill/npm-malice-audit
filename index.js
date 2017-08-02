#!/usr/bin/env node

'use strict';

const async = require('async');
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

const tasks = manifest.filter(item => typeof item === 'string').map(item => {
  return (callback) => {
    const start = Date.now();
    const name = `| ${item} |`;
    const bar = '-'.repeat(name.length);

    console.log([bar, name, bar].join(os.EOL));

    remote.ls(item, 'latest', true, (result) => {
      result = _.uniq(result.filter(v => typeof v === 'string').map(v => v.split('@')[0]));

      const time = Date.now() - start;
      const detected = result.filter(v => malicious.indexOf(v) !== -1);

      stats.count += result.length;
      stats.detected += detected;

      console.log(`Audited ${result.length} packages.`);

      if (!result.length) {
        console.log('This may mean the package is private or otherwise not accessible. Look for error output below!');
      }

      console.log(`Completed in ${time / 1000} seconds.`);
      console.log(`Found ${detected.length} malicious packages in the tree!`);
      console.log(detected.map(v => `- ${v}`).join(os.EOL));

      callback(null, result);
    });
  };
});

async.series(tasks, function(err, results) {
  if (logs.length) {
    console.log('= ERRORS =' + ('='.repeat(30)));
  }

  console.log('= SUMMARY =' + ('='.repeat(29)));
  console.log(`Audited ${stats.count} total packages.`);
  console.log(`Completed audit in ${(Date.now() - stats.start) / 1000} seconds.`);
  console.log(`Found a total of ${stats.detected} malicious packages!`);
});
