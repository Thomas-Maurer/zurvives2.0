zurvives.factory('flashService', function(socket) {
    return {
        emit: function(message){
            socket.emit('flash:message:send',{message: message});
        },
        broadcast: function(message){
            socket.emit('flash:message:broadcast',{message: message});
        }
    }

});
