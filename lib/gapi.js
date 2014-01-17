var googleapis = require('googleapis'),
    OAuth2Client = googleapis.OAuth2Client,
    client = '501767073550-903gbfqneojl2tjcq65mbivklt4qjuua.apps.googleusercontent.com',
    secret = 'UcPSE8fUTlp1KcJQ6EJPioln',
    redirect = 'http://127.0.0.1:3000',
    calendar_auth_url = '',
    oauth2Client = new OAuth2Client(client, secret, redirect);

calendar_auth_url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar'
});

var callback = function(clients) {
  //console.log(clients);
  exports.cal = clients.calendar;
  exports.oauth = clients.oauth2;
  exports.client = oauth2Client;
  exports.url = calendar_auth_url;
};

googleapis.discover('calendar', 'v3').discover('oauth2', 'v2').execute(function(err, client){
    if(!err){
      //console.log('calling callback');
      callback(client);
    }
  });


