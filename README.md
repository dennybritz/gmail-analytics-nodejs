On June 26, 2014 Google announced a new [Gmail API](https://developers.google.com/gmail/api/). Among other things, the API allows developers to read messages, send mail, and manage labels.

This repository contains scripts to perform analytics on your own Gmail account. It is written in node.js because I've been wanting to learn node for a while. In order to run the scripts you must obtain credentials through the Google Developer Console. [Refer to the Gmail authentication guide for more details](https://developers.google.com/gmail/api/auth/about-auth).

All features listed below correspond to directories in the repository.

#### message-dump

The *message-dump* application reads all messages that are NOT spam or trash from your gmail account, converts them into JSON objects, and exposed the data as a stream. The data is streamed because the Gmail API is limited to 5 "GET message" API requests per second. Thus, getting a full data dump of your gmail account may take a while. You can limit the data to a certain time period using arguments. `message-dumper` is a node.js module that abstrcts the authentication and API calls. The `message-dump-console` application print each email message to stdout, one JSON object per line.

    cd message-dump
    # Usage: message-dump PORT [start-date] [end-date] 
    # Starts an HTTP server on port 3000
    node message-dump 3000 2014-01-01 2014-05-01
    # Visit http://localhost:3000

