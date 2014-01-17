var fb_api = require('fbgraph');
var conf = {
    client_id:      '657597644283584'
  , client_secret:  'd46c0958ec2b3e4fd6eb146acc6de5f0'
  , scope:          'user_events'
  , redirect_uri:   'http://127.0.0.1:3000/fb_code'
};

var fb_oauth_url = fb_api.getOauthUrl({
	"client_id": conf.client_id, 
	"redirect_uri": conf.redirect_uri, 
	"scope": conf.scope
});

module.exports.fb_api = fb_api;
module.exports.conf = conf;
module.exports.fb_oauth_url = fb_oauth_url;
