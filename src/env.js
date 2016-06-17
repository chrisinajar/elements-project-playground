var fs = require('fs');
var env = getUserData();

module.exports = {
  pass: env.RPC_PASS,
  user: env.RPC_USER
};

function getUserData () {
  var data = fs.readFileSync('./.env').toString().split('\n');
  var env = {};
  data
    .map(function (str) {
      return str.trim();
    })
    .filter(function (str) {
      return str.length;
    })
    .forEach(function (line) {
      var data = line.split('=');
      env[data.shift().split(' ')[1]] = data.join('=');
    });
  return env;
}
