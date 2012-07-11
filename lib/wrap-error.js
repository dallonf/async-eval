module.exports = function(err) {
	if (err && err.__proto__ && global[err.__proto__.name]) {
		err.__proto__ = global[err.__proto__.name].prototype;	
	}
	return err;
}