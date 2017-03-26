var active_user = '';
var me = null;
var my_name = '';
var socket = io();

var User = Backbone.Model.extend({
  defaults: {
    username: '',
    name: ''
  }
});

var Users = Backbone.Collection.extend({});

var users = new Users();

var UserView = Backbone.View.extend({
  model: new User(),
  // tagName: 'button',
  initialize: function(){
    this.template = _.template($('#user-template').html());
  },
  events: {
    'click .user-button': 'selected'
  },
  selected: function() {
    active_user = this.model.toJSON().username;
    $('#user-list button').each(function(){
      $(this).removeClass('active');
    });
    this.$('.user-button').addClass('active');
    messagesView.render();
  },
  render: function() {
    // console.log(this.template(this.model));
    var data = this.model.toJSON();
    this.$el.html(this.template(data));
    if(data.username == active_user){
      this.$('.user-button').addClass('active');
    }
    return this;
  }
});

var UsersView = Backbone.View.extend({
  model: users,
  el: $('#user-list'),
  initialize: function() {
    var self = this;
    this.model.on('add', this.render, this);
    this.model.on('remove', this.render, this);
  },
	render: function() {
		var self = this;
		this.$el.html('');
		_.each(this.model.toArray(), function(user) {
			self.$el.append((new UserView({model: user})).render().$el);
		});
		return this;
	}
});

var usersView = new UsersView();


//Message
var Message = Backbone.Model.extend({
  defaults: {
    msg: '',
    from: '',
    to: '',
    from_name: ''
  }
});

var Messages = Backbone.Collection.extend({});

var messages = new Messages();

var MessageView = Backbone.View.extend({

    model: new Message(),
    tagName: 'li',
    initialize: function(){
      this.template = _.template($('#message-template').html());
    },
    render: function() {
      var data = this.model.toJSON();
      this.$el.html(this.template(data));
      return this;
    }
});


var MessagesView = Backbone.View.extend({
  model: messages,
  el: $('.message-list'),
  initialize: function() {
    var self = this;
    this.model.on('add', this.render, this);
    this.model.on('remove', this.render, this);
  },
	render: function() {
		var self = this;
		this.$el.html('');
		_.each(this.model.toArray(), function(message) {
      if((message.get('from') == active_user && message.get('to') == me) || (message.get('to') == active_user && message.get('from') == me)){
        var element = (new MessageView({model: message})).render().$el;
        if(message.get('from') == me){
          element.addClass('mine-message');
        } else{
          element.addClass('their-message');
        }
        self.$el.append(element);
      }
		});
    $('.message-list').scrollTop($('.message-list').prop('scrollHeight'));
		return this;
	}
});

var messagesView = new MessagesView();


$(document).ready(function() {
  socket.on('add_user', function(data) {
    user = new User(data);
    users.add(user);
  });
  socket.on('remove_user', function(data){
    if(active_user == data.username){
      active_user='';
    }
    users.where({username: data.username}).forEach(function(item) {
      users.remove(item);
    });
  });
  socket.on('message_receive', function(data){
    message = new Message(data);
    messages.add(message);
    if(active_user != data.from){
      active_user = data.from;
      messagesView.render();
      usersView.render();
    }
  });
  socket.on('messages_receive', function(data){
    me = data.me;
    my_name = data.my_name;
    data.messages.forEach(function(message){
      messages.add(new Message(message));
    });
  });
  $('#chat_app_form').submit(function () {
    var msg = $('#message').val();
    if(active_user == ''){
        alert('Please select a user!');
    }else if(msg == '' || msg == null){
        alert('Please write a message!');
    }else{
        var data = {'msg': msg, 'to': active_user};
        socket.emit('send_message', data);
        $('#message').val('');
        data.from = me;
        data.from_name = my_name;
        var new_message = new Message(data);
        messages.add(new_message);
    }
    return false;
  });
});
