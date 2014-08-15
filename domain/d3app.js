http://jsfiddle.net/m12s87tq/1/

var source = new EventSource("http://localhost:8000/dump?filter=");
source.addEventListener('message', function(e) {
  console.log(JSON.parse(e.data))
}, false);