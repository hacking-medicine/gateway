var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var db = require('./db.js')
var RT = require('./rt.js')

db.prepare_thresholds('localhost', 3000);

var rt_analysis = RT({host: 'localhost', port: '3000'});
rt_analysis.start(
function(e){
	return {
		dataType: param_map[e.param_t],
		value: e.value,
		time: e.timestamp,
		patient: e.user_id
	}
}

	);

var rt_notifier = RT({host: 'localhost', port: '3001'});
rt_notifier.start();

// Constants
var PORT = 8080;



// App
var app = express();
app.configure(function(){
 	app.use(bodyParser.json());
  	app.use(app.router);
  	app.use(cors());
});


var param_map = {};
db.get_params(function(map){
	param_map = map;
	console.log(param_map);
});


app.post('/monitor', function (req, res) {
	console.log('REQUEST TO MONITOR');
	var user_id = req.body.user_id;
	var measurement_list = req.body.measurements;

	measurement_list = measurement_list.map(function(measurement){
		measurement.user_id = user_id;
		return measurement;
	})

	for (var i = measurement_list.length - 1; i >= 0; i--) {
		db.save_measurement(user_id, measurement_list[i]);
		//rt_analysis.queue(measurement_list[i]);
		rt_notifier.queue(measurement_list[i]);
	};

	res.send('correct');
});

app.get('/threfresh', function (req, res) {
	db.prepare_thresholds('localhost', 3000);
	res.send('correct');
});


//connection.end();
//rt_analysis.stop();

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
