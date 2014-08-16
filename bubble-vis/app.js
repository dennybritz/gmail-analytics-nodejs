// Usage: node app.js [PORT]


// We don't really need express, but it makes things simpler :)
var express = require('express');
var app = express();
app.use(express.static('public'));

var PORT = process.argv[2]

// Returns the value of the first header found for the given headerName
// Returns undefined in case no such header is present
function getHeader(message, headerName) {
  return message.payload.headers
    .filter(function(h) { return h.name === headerName; })
    .map(function(h) { return h.value; })
    .shift();
}

app.get('/dump', function(req, res){
  // Start a message dump with the given filter
  var filterQuery = req.query.filter
  messageStream = require('./../message-dump/message-dumper')(filterQuery)

  res.set('Content-Type', 'text/event-stream');
  // Send each data record to the HTTP reponse
  messageStream.on('data', function(message){
    record = {
      'from': getHeader(message, 'From'),
      'to': getHeader(message, 'To'),
      'date': getHeader(message, 'Date'),
      'subject': getHeader(message, 'Subject')
    };
    // We send data in event-stream format
    // See https://developer.mozilla.org/en-US/docs/Server-sent_events/Using_server-sent_events#Event_stream_format
    res.write('data: ' + JSON.stringify(record) + '\n\n');
  });
  // Close the HTTP response at the end of the dump
  messageStream.on('end', function(){ res.end(); });
});


app.listen(PORT);