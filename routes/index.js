
exports.index = function(req, res){
  var title = 'Campus Synergy Home';
  res.render('index', { title: title});
};

exports.test = function(req, res){
	console.log("sending the test.jade");
	res.render('test');
};

/*
exports.about = function(req, res){
  res.render('about', { title: 'about' })
};
exports.contact = function(req, res){
  res.render('contact', { title: 'Contact' })
};
*/