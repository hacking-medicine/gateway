var http = require('http');
var _ = require('underscore');

var RealTime = function(options){

	var queue = [];
	var interval = null;

	var sendQueue = function(mapper){
		if (queue.length == 0){
			return;
		}

		var dst_queue = queue;
		if (mapper){
			dst_queue = queue.map(mapper);
		}

		var post_data = JSON.stringify(dst_queue);
		var post_options = {
			method: 'POST',
			headers: {
		    	'Content-Type': 'application/json',
				'Content-Length': post_data.length
		    }
		}

		post_options = _.extend(post_options,options);

		var request = http.request(post_options, function(res){
			res.setEncoding('utf8');
      		res.on('data', function (chunk) {
      		});
		});

		queue = [];

		request.write(post_data);
		request.end();
	}

	return {
		queue: function(message){
			queue.push(message);
		},
		start: function(mapper){
			setInterval(function(){
				sendQueue(mapper);}, 1000);
		},
		stop: function(){
			if (interval){
				clearInterval(interval);
				interval = null;
			}
		}
	}

};

module.exports = RealTime;
