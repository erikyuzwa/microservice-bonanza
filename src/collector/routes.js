
'use strict';

const Express = require('express');
let router = Express.Router();

/* POST */
router.post('/v1/collector', function(req, res) {

	let data = req.body;
	let count = 0;
	if (data) {
		for (let prop in data) {

		   // if (data.hasOwnProperty(prop)) {
		        //switch (prop) {
		            // obj[prop] has the value
		        //}
		    //}
			count++;
		}

	} else {
		count = 0;
	}

	res.send({'status': 'ok', 'items-received': count});

});

module.exports = router;
