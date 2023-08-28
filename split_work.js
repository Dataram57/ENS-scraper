const { spawn } = require('child_process');
const config = require('./split_config.json');
config.forEach(params => {
    spawn('node', ['app.js'].concat(params));
});