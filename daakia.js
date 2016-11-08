/**
 * Daakia
 * @constructor
 * @param {string} url
 * @param {Parser} Parser
 */

function Daakia (url, Router, Client, Transport) {
  if(!this instanceof Daakia) {
    throw Error("Daakia called without the new keyword")
  }
  var tp = Transport || WebSocketTransport;

  this.transport = new tp(url);
  new Router(Client,this.transport);
}

/**
 * Payload
 * @constructor
 * @param {Uint8Array} message
 */

function Payload(message) {
   if(!this instanceof Payload) {
    throw Error("Payload called without the new keyword")
  }
  this._bb = message;
}

Payload.prototype.Buffer = function () {
  return this._bb;
};

Payload.prototype.Method = function() {
  return this._bb[0];
};

Payload.prototype.MutMethod = function(byte) {
  this._bb[0] = byte;
};

Payload.prototype.ReqId = function() {
  return this._bb.slice(1,5);
};
Payload.prototype.MutReqId = function(value) {
  this._bb[1] = value;
  this._bb[2] = value >> 8;
  this._bb[3] = value >> 16;
  this._bb[4] = value >> 24;
};

Payload.prototype.Data = function() {
  return this._bb.slice(5);
};



this.Daakia = Daakia;
this.Payload = Payload;