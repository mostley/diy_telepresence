var peer = new Peer();

function connect() {
  var conn = peer.connect(document.getElementById('peer_id').value);
  conn.on('open', function () {
    conn.send('Hello!');
  });
  conn.on('data', function (data) {
    console.log(data);
  });
}
