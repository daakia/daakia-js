/**
 * Daakia
 * @constructor
 * @param {string} url
 * @param {Parser} Parser
 */

function Daakia (url, Middleware, Client, Transport) {
  if(!this instanceof Daakia) {
    throw Error("Daakia called without the new keyword")
  }
  var tp = Transport || WebSocketTransport;

  this.transport = new tp(url);
  new Middleware(Client,this.transport);
}

this.Daakia = Daakia;