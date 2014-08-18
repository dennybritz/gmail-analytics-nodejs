var dumper = require('./message-dumper')

var messageStream = dumper(process.argv[2]);

var counter = 0;

// Print the preview snippet of each message
messageStream.on('data', function(message){
  console.log(JSON.stringify(message));
  counter++;
  if (counter % 1000 == 0)
    console.error('Progress: %d messages', counter);
})