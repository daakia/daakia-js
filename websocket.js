/**
 * A Websocket Connection
 * @constructor
 * @param {string} url
 */
function WebSocketTransport(url) {
  if (!this instanceof WebSocketTransport) {
    throw TypeError("Failed to construct 'WebSocketTransport': Please use the 'new' operator")
  }
  this._url = url;
  this.buffer = new Uint8Array(100000);
  this.offset = 0;
  this._attempts = 0;
}
/**
 * WebSocket object
 * @type {WebSocket}
 * @private
 */
WebSocketTransport.prototype._ws = null;
WebSocketTransport.prototype._on_connect_func = null;
WebSocketTransport.prototype.Connect = function () {
  this._connect();
};
WebSocketTransport.prototype._send = function () {
  if (this._ws && this._ws.readyState == this._ws.OPEN && this.offset > 0) {
    this._ws.send(this.buffer.subarray(0,this.offset));
    this.offset = 0;
  }
};
WebSocketTransport.prototype._connect = function () {
  var self = this;
  this.closed = false;
  this._ws = null;
  this._ws = new WebSocket(this._url);
  this._ws.binaryType = "arraybuffer";

  var onclose = function () {
    if(!self.closed) {
      var delay = (Math.pow(2, self._attempts) - 1) * 1000;
      setTimeout(self._connect.bind(self), delay);
    }
  };
  this._sender = null;
  this._ws.onclose = onclose;
  this._ws.onerror = onclose;
  this._ws.onopen = function () {
    self._on_connect_func = self._on_connect_func || function () {};
    self._attempts = 0;
    self._sender = setInterval(self._send.bind(self), 10);
    self._on_connect_func();
  };

  this._ws.onmessage = this._on_message;
  if (this._attempts < 8) {
    this._attempts++;
  }
};

WebSocketTransport.prototype.close = function() {
  this._send();
  this.closed = true;
  if(this._sender) {
    clearInterval(this._sender);
    this._sender = null;
  }
  this._ws.close();
};


WebSocketTransport.prototype._on_message = function (message) {
  this._next(message.data);
};

WebSocketTransport.prototype.Next = function (on_msg_func) {
  this._next = on_msg_func;
};

WebSocketTransport.prototype.OnConnect = function (on_connect_func) {
  this._on_connect_func = on_connect_func;
};

WebSocketTransport.prototype.Send = function (header, payload) {
  var total_length = header.byteLength + payload.byteLength;
  var new_offset = this.offset + total_length + 4;
  if(new_offset >= this.buffer.byteLength) {
    this._send();
    new_offset = this.offset+total_length+4;
  }
  var buf = this.buffer.subarray(this.offset,new_offset,this.buffer.byteLength);

  var dv = new DataView(buf.buffer,this.offset,4);
  this.offset = new_offset;
  dv.setUint32(0, total_length, true);
  buf.set(header, 4);

  buf.set(payload, 4+header.byteLength);

};

this.WebSocketTransport = WebSocketTransport;