var mysql = require('mysql');
var http = require('http');


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'pass',
  database : 'heart',
  port     :  3306
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

exports.prepare_thresholds = function (rtproc_host, rtproc_port) {
	connection.query('INSERT INTO stats (user_id, param_t, avg, var) SELECT user_id, param_t, AVG (value), STDDEV(value) FROM raw_data GROUP BY user_id, param_t;',
	function(err, rows, fields) {

		if (err) {
			console.log(err);
		}
		else {
			console.log("Stat calc ok");
		}

		connection.query('SELECT user_id, param_t, avg, var FROM stats;',
			function (err, rows, fields) {
				var payload = [];

				if (err){
					console.log(err);
					return;
				}

				console.log("THQuery done");
				console.log(JSON.stringify(rows));

				for (var i = 0; i < rows.length; i++) {
					var threshold = {
						dataTypeId: rows[i].param_t,
						thMin: rows[i].avg - 2 * rows[i].var,
						thMax: rows[i].avg + 2 * rows[i].var,
						triggerId: 1
					};

					payload.push(threshold);
				}

				console.log("Found " + payload.length + " thresholds");

				if (payload.length > 0)
				{
					var jsonObject = JSON.stringify(payload);

					var postHeaders = {
							'Content-Type' : 'application/json',
							'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
					};

					var postOptions = {
						host: rtproc_host,
						port: rtproc_port,
						path: "/thresholds",
						method: "POST",
						headers: postHeaders
					};

					var rPost = http.request(postOptions, function(res) {
						var strData = "";
						console.log("statusCode: ", res.statusCode);
						res.on('data', function(d) {
							console.info("Returned something");
							strData += d;
							console.log(strData);
						});
					});

					rPost.write(jsonObject);
					rPost.end();
					rPost.on('error', function(e) {
						console.error(e);
					});
				}
			});
	});
}
