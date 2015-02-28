var express = require('express');
var bodyParser = require('body-parser');

var db = require('./db.js')
var RT = require('./rt.js')

var rt_analysis = RT({host: 'localhost', port: '3000'});
rt_analysis.start();

var rt_notifier = RT({host: 'localhost', port: '3001'});
rt_notifier.start();

// Constants
var PORT = 8080;



// App
var app = express();
app.configure(function(){
 	app.use(bodyParser.json());
  	app.use(app.router);
});


var param_map = {};
db.get_params(function(map){
	param_map = map;
	console.log(param_map);
});


app.post('/monitor', function (req, res) {
	var user_id = req.body.user_id;
	var measurement_list = req.body.measurements;

	for (var i = measurement_list.length - 1; i >= 0; i--) {
		db.save_measurement(user_id, measurement_list[i]);
		rt_analysis.queue(measurement_list[i]);
		rt_notifier.queue(measurement_list[i]);
	};

	res.send('correct');
});

app.post('/', function(req, res){
	console.log('recived:');
	console.log(req.body);
	res.send('correct');
});


//connection.end();
//rt_analysis.stop();

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);