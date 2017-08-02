#!/usr/bin/env node

'use strict';

const _ = require('lodash');
const os = require('os');
const path = require('path');
const remote = require('npm-remote-ls');
const malicious = require('./malicious.json');

const bail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const detect = (obj) => {
  const keys = Object.keys(obj);
};

let manifest;

try {
  manifest = require(path.resolve(process.cwd(), 'npm-malice-audit.json'));
} catch (x) {
  bail('Could not load npm-malice-audit.json, please make sure it exists and contains valid JSON!');
}

if (!Array.isArray(manifest)) {
  bail('The npm-malice-audit.json file must contain an array!');
}

manifest = manifest.filter(item => typeof item === 'string');

if (!manifest.length) {
  bail('The npm-malice-audit.json file must contain strings!');
}

remote.config({

  // Silence messages from npm-remote-ls.
  // logger: {
  //   log: () => {}
  // },

  // We want _all_ dependencies.
  development: true,
  optional: true,
  peer: true
});

console.log('Auditing...');

manifest.forEach(item => {
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
