/**
 * A Websocket Listener
 * @constructor
 * @param {string} url
 */
function WebSocketTransport(url) {
  if(!this instanceof WebSocketTransport) {
    throw Error("Websocket Transport called without the new keyword")
  }
  this._url = url;
  this._attempts = 0;
}
/**
 * WebSocket object
 * @type {WebSocket}
 * @private
 */
WebSocketTransport.prototype._ws = null;
WebSocketTransport.prototype._on_connect_func = null;
WebSocketTransport.prototype.Connect = function() {
  this._connect();
};
WebSocketTransport.prototype._connect = function () {
  var self = this;
  this._ws = null;
  this._ws = new WebSocket(this._url);
  this._ws.binaryType = "arraybuffer";

  var onclose = function () {
    var delay = (Math.pow(2, self._attempts) - 1)*1000;
    setTimeout(self._connect,delay);
  };
  this._ws.onclose = onclose;
  this._ws.onerror = onclose;
  this._ws.onopen = function() {
    self._on_connect_func = self._on_connect_func || function(){};
    self._attempts = 0;
    self._on_connect_func();
  };

  this._ws.onmessage = this._on_message;
  if(this._attempts <8) {
      this._attempts++;
  }
};


WebSocketTransport.prototype.OnMessage = function(on_msg_func){
  this._on_message = on_msg_func;
  this._ws.onmessage = on_msg_func

};

WebSocketTransport.prototype.OnConnect = function(on_connect_func) {
  this._on_connect_func = on_connect_func;
};

WebSocketTransport.prototype.Send = function(message) {
  this._ws.send(message);
};

this.WebSocketTransport = WebSocketTransport;