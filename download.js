// Lazy to write for the part that download images. Code is copied from stackoverflow. 
// https://stackoverflow.com/questions/12740659/downloading-images-with-node-js

var fs = require('fs');
var request = require('request');
var progress = require('request-progress');

module.exports = function (uri, path, onProgress, onResponse, onError, onEnd) {
    progress(request(uri))
        .on('progress', onProgress)
        .on('response', onResponse)
        .on('error', onError)
        .on('end', onEnd)
        .pipe(fs.createWriteStream(path))
};