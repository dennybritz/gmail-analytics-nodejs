var google = require('googleapis')
var http = require('http')
var through = require('through')
var url = require('url')
var util = require('util')

var gmail = google.gmail('v1')
var OAuth2 = google.auth.OAuth2

// We assume the Gmail API client id, client secret and redirect uri are set using environment variables
var PORT = 11337 // We listen on this port for the OAuth callback
var CLIENT_ID = process.env["GOOGLE_CLIENT_ID"]
var CLIENT_SECRET = process.env["GOOGLE_CLIENT_SECRET"]
var REDIRECT_URL =  util.format('http://localhost:%d/callback', PORT)

// Authentication using OAuth2
// This opens a web browser process
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
var authUrl = oauth2Client.generateAuthUrl({scope: scopes});

// Create a streams that will receive all message ids and messages
var messageIDStream = through();
var messageStream = through();

// Request the message for each message ID and add it to the message stream
messageIDStream.on('data', function(messageId){
  getMessage(messageId, function(err, message){
    if (err) {
      // Probably reached API limit, requeue
      console.error(err);
      messageIDStream.write(msg.id, 'utf8');
    } else {
      messageStream.write(message);
    }
  });
})

// Recursively requests all message IDs and writes each ID to the given result stream
function getMessages(pageToken, filterQuery, writeStream){
  gmail.users.messages.list({ userId: 'me', pageToken: pageToken, q: filterQuery}, function(err, response){
    response.messages.forEach(function(msg){
      writeStream.write(msg.id, 'utf8');
    })
    if (response.nextPageToken)
      getMessages(response.nextPageToken, filterQuery, writeStream)
  });
}

// Requests a single message
function getMessage(messageId, callback){
  gmail.users.messages.get({ userId: 'me', id: messageId }, function(err, response){
    callback(err, response);
  });
}

// We export the messageStream as the constructor (with authentication procedure)
module.exports = function(filterQuery){
  // We start a HTTP server that listens for the OAuth callback
  var server = http.createServer(function(request, response) {
    var callbackUrl = url.parse(request.url, true);
    if (callbackUrl.pathname == '/callback') {
      oauth2Client.getToken(callbackUrl.query.code, function(err, tokens) {
        oauth2Client.setCredentials(tokens);
        // Also set the as the default authentication method
        google.options({ auth: oauth2Client });
        // Start getting messages
        getMessages(null, filterQuery, messageIDStream);
      })
      response.end('Authentication successful. You can now return to the application.');
    }
  }).listen(PORT);
  
  require('child_process').spawn('open', [authUrl]);
  return messageStream
}

