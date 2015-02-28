var http = require('http');
var _ = require('underscore');

var RealTime = function(options){

	var queue = [];
	var interval = null;

	var sendQueue = function(){
		if (queue.length == 0){
			return;
		}

		var post_data = JSON.stringify(queue);
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
          		console.log('Response: ' + chunk);
          		if (chunk == "correct"){
					queue = [];
				}
      		});
		});

		request.write(post_data);
		request.end();
	}

	return {
		queue: function(message){
			queue.push(message);
		},
		start: function(){
			setInterval(sendQueue, 1000);
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