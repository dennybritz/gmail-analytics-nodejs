var dumper = require('./message-dumper')

var messageStream = dumper(process.argv[2]);

// Print the preview snippet of each message
messageStream.on('data', function(message){
  console.log(JSON.stringify(message));
})