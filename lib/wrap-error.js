module.exports = function(err) {
	err.__proto__ = global[err.__proto__.name].prototype;
	return err;
}