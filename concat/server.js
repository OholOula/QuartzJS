"use strict";


const http = require('http');
const fs = require('fs');
var concat = require('./concat.js');
const config = JSON.parse(fs.readFileSync('./config.js'));      

var hostname = config.hostname || '127.0.0.1',
    port = config.port || 80;

var server = http.createServer(function (request , response) {
    delete require.cache[require.resolve('./concat.js')];
    concat = require('./concat.js');
    
    concat.run(config.path , response);
    response.end();
});

server.listen(port , hostname);
console.log(`running: ${hostname}:${port}`);