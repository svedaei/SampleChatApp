module.exports = function(io){
  var Message = require('./models/Message.model')
  var users = [];
  io.on('connection', function(socket){
    console.log("New user has been connected!");
    var user = socket.handshake.session.user;
    if(user){
      for(entry in users){
        var _user = users[entry];
        socket.emit('add_user', {'username': entry, 'name': _user.name});
      }
      users[user.username] = {'socket_id': socket.id, 'name': user.name};
      io.emit('add_user', {'username': user.username, 'name': user.name});
      Message.find({$or:[{from: user.username}, {to: user.username}]}, function(err, messages) {
        var data = {'messages': messages, me: user.username, my_name: user.name};
          socket.emit('messages_receive', data);
      });
      // socket.emit('message_receive')

      socket.on('disconnect', function(){
        if(socket.handshake.session.user){
          var user = socket.handshake.session.user;
          var username = user.username;
          delete users[username];
          io.emit('remove_user', {'username': username});
        }
      });
      socket.on('send_message', function (data) {
        var user = socket.handshake.session.user;
        var to = data.to;
        var text = data.msg;
        var message_data = {
          msg: text,
          from: user.username,
          to: to,
          from_name: user.name
        };
        var message = new Message(message_data);
        io.sockets.connected[users[to].socket_id].emit('message_receive', message_data);
        message.save(function(err){
          if(err){
            console.log("Error saving message!");
          }
        });
      });
    }
  });
};
