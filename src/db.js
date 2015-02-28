var mysql = require('mysql');


var connection = mysql.createConnection({
  host     : '192.168.59.103',
  user     : 'root',
  password : 'pass',
  database : 'heart',
  port     :  49154
});

connection.connect();

var param_map = null;

exports.get_params = function(callback){
	connection.query('SELECT id, param_name FROM params;', 
		function(err, rows, fields) {
			param_map = {};
			if (err){
				console.log(err);
				return;
			}
			for (var i = 0; i < rows.length; i++) {
				param_map[rows[i].param_name] = rows[i].id;
			};

			callback(param_map);

		}
	);
}


exports.save_measurement = function(user_id, measurement){
	connection.query('INSERT INTO raw_data (user_id, timestamp, param_t, value) VALUES (?,?,?,?)',
		[user_id, new Date(measurement.timestamp), param_map[measurement.param], measurement.value ],
		function(err, rows, fields){ 
			if(err){
				console.log(err);
			}
		}
	);
}