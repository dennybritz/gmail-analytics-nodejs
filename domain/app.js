var express = require('express');
var app = express();

var PORT = process.argv[2]

app.get('/dump', function(req, res){
  var filterQuery = req.query.filter
  messageStream = require('./../message-dump/message-dumper')(filterQuery)
  messageStream.on('data', function(message){
    to = message.payload.headers
      .filter(function(h) { return h.name === 'To'; })
      .map(function(h) { return h.value; })
      .shift();
    from = message.payload.headers
      .filter(function(h) { return h.name === 'From'; })
      .map(function(h) { return h.value; })
      .shift();
    res.write(JSON.stringify({'from': from, 'to': to }) + '\n');
  });
  messageStream.on('end', function(){
    res.end();
  });
});

app.listen(PORT);