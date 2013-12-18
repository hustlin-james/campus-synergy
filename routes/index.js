
var myBuildingsJSON;

exports.init = function(buildings){
	myBuildingsJSON = buildings;
};

exports.index = function(req, res){
  var title = 'Campus Synergy Home';
  //console.log('myBuildings length: ' + myBuildings.length);
  res.render('index', { title:title, buildingsJson:myBuildingsJSON});
};

exports.buildingsJson = function(req, res){
	res.send(myBuildingsJSON);
};
