var express = require('express');
var bodyParser = require('body-parser');

var db = require('./db.js')

// Constants
var PORT = 8080;

// Mysql connection (one is enough)




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
	console.log(req.body);
	var user_id = req.body.user_id;
	var measurement_list = req.body.measurements;

	for (var i = measurement_list.length - 1; i >= 0; i--) {
		db.save_measurement(user_id, measurement_list[i]);
	};

	res.send('correct');
});


//connection.end();

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);