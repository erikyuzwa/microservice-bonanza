
'use strict';

const Express = require('express');
let router = Express.Router();

/* POST */
router.post('/v1/collector', function(req, res) {
	res.send({'status': 'ok', 'items-received': 100});
});

module.exports = router;
