'use strict';

var wallet = require('./cli/wallet');

require('yargs')
  .usage('sidechain.js command [options...]')
  .command(wallet.command, wallet.describe, wallet.builder, wallet.handler)
  .demand(1)
  .help()
  .argv;
