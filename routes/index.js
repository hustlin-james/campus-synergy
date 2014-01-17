var url = require('url');
var myBuildingsJSON;
var gapi;
var myCounter;
var myGoogleCalJSON;
var fb_api;
var myFbApiJSON;

exports.init = function(buildings, myGapi, myFbApi){
 // console.log(fb_api.fb_oauth_url);
	myBuildingsJSON = buildings;
	gapi = myGapi;
  fb_api = myFbApi;
};

exports.index = function(req, res){
  myCounter = 0;
  var title = 'Campus Synergy Home';
  //console.log('myBuildings length: ' + myBuildings.length);
  //console.log('gapi.url: ' + gapi.url);
  var code = req.query.code;
  var whichApiCode = req.query.whichapi;
  
  //console.log('Cookies: '+req.headers.cookie);

  var userName='';
  if(req.headers.cookie){
    var allCookies=req.headers.cookie.split(';');
    var allCookiesLen=allCookies.length;
    for(var i=0; i < allCookiesLen;i++){
      var parts = allCookies[i].split('=');
      if(parts[0] && parts[0].trim() === 'campusSynergyUsername'){
        userName=JSON.parse(parts[1].trim()).username;
      }
    }
  }

  //console.log('campusSynergyUsername: ' + userName);
  //Just to make sure it has a value, so when
  //it is empty it just renders the index like it does
  if(whichApiCode == null)
    whichApiCode = '';

  if(code != null && whichApiCode == 'fb'){
    //console.log('fb code: '+code);
    fb_api.fb_api.authorize({
          "client_id":fb_api.conf.client_id
        , "redirect_uri":fb_api.conf.redirect_uri
        , "client_secret":fb_api.conf.client_secret
        , "code":code
      },
      function (err, facebookRes) {
        //console.log(facebookRes);
        if(!err && facebookRes){
          //console.log('facebookRes: ' + facebookRes);
          //Retrieve the events
          fb_api.fb_api.get('me?fields=events', function(err, graphRes){

            if(graphRes.events != null){
              var fbEvents = graphRes.events.data;
              fbApiEventsCall(fbEvents, res, userName);
            }

          });

        }else{
          console.log('Error occurred');
        }
    });
  }
  else if(code != null && whichApiCode != 'fb'){
    //console.log('code: ' + code);
    //console.log('url: ' + url.parse(req.url).pathname);

    gapi.client.getToken(code, function(err, tokens){
      //console.log('retrieved tokens');
      //console.log('tokens: ' + tokens);
      gapi.client.credentials = tokens;

      getData({ 
        myRes: res,
        title: title, 
        buildingsJson: myBuildingsJSON,
        gOauthUrl: gapi.url,
        fbApiUrl: fb_api.fb_oauth_url,
        googleCalJSON: null,
        fbEventsJSON: myFbApiJSON,
        myUserName: userName
      });

    });

    //res.redirect('/'); 
  }
  else{
    //console.log('fb_api: ' + fb_api.fb_oauth_url);
    res.render('index', { 
    	title: title, 
    	buildingsJson: myBuildingsJSON,
    	gOauthUrl: gapi.url,
      googleCalJSON: myGoogleCalJSON,
      fbApiUrl: fb_api.fb_oauth_url,
      fbEventsJSON: myFbApiJSON
    });
  }
};

exports.buildingsJson = function(req, res){
	res.send(myBuildingsJSON);
};

function fbApiEventsCall(fbEventsWithId,res,userName){

  var fbEventsLength = fbEventsWithId.length;
  var fbEventsIndex = 0;
  var allFbEventsProcessed = [];

  for(var i = 0; i < fbEventsLength; i++){
    var graphEventId = fbEventsWithId[i]['id'];
    fb_api.fb_api.get(graphEventId, function(err, eventRes){
      fbEventsIndex++;
      //eventRes['myUserName'] = userName;
      allFbEventsProcessed.push(eventRes);
      //Finished with all the events
      if(fbEventsIndex == fbEventsLength){
        var allFbEventsProcessedWithUsername = {'campusSynergyUsername':userName,
          'allFbEventsProcessed':allFbEventsProcessed};
        myFbApiJSON = JSON.stringify(allFbEventsProcessedWithUsername);
        res.redirect('/');
      }

    });
  }
  
}

function gApiEventsCall(cal_id, cal_sum, cal_descrip, cal_events, jsonData, resultsLength, res){
    gapi.cal.events.list({calendarId:cal_id}).withAuthClient(gapi.client).execute(function(eventsError, eventsResults){
        //counter++;
        myCounter++;
        //console.log('counter: ' + counter);
        //console.log('myCuounter: ' + myCounter);

        if(typeof eventsResults === 'object' && eventsResults != null){
           //console.log('eventsResults: ' + eventsResults);
           var eventsList = eventsResults['items'];
           //console.log('eventsList: ' + eventsList);
           
           for(var i =0; i < eventsList.length; i++){
              //console.log('eventsList[i]: ' + eventsList[i]);
              var eventDescription = eventsList[i].description;
              var eventLocation = eventsList[i].location;
              var eventSummary = eventsList[i].summary;
              var eventStart = eventsList[i].start.dateTime;
              var eventEnd = eventsList[i].end.dateTime;

              var eventHash = {};
              eventHash['description'] = eventDescription;
              eventHash['eventLocation'] = eventLocation;
              eventHash['eventSummary'] = eventSummary;
              eventHash['eventStart'] = eventStart;
              eventHash['eventEnd'] = eventEnd;

              //cal_data.cal_events.push(eventHash);
              cal_events.push(eventHash);
           }
           
        }

        var final_call = false;
        if(myCounter == resultsLength){
          final_call=true;
        }

        if(cal_events.length > 0 && !final_call){
          var cal_data = {'cal_sum':cal_sum, 'cal_descrip': cal_descrip, 'cal_events':cal_events};
          jsonData[cal_id] = cal_data;
        }else if(final_call){
          if(cal_events.length > 0){
            var cal_data = {'cal_sum':cal_sum, 'cal_descrip': cal_descrip, 'cal_events':cal_events};
            jsonData[cal_id] = cal_data;
          }
          myGoogleCalJSON = JSON.stringify({'campusSynergyUsername':res.myUserName, 'googleJsonData':jsonData});
          //This is the final call of the events data
          //Take the json structure and embed it into the index webpage

          res.myRes.redirect('/');
        }
      });
}


//Returns the google data for the user
var getData = function(res){
  //console.log('In get Data');
  var jsonData = {};

  //Calendar data types returned: https://developers.google.com/google-apps/calendar/v3/reference/calendars#resource
  //event data types returned: https://developers.google.com/google-apps/calendar/v3/reference/events#resource
  /*
  User information, don't need this
  gapi.oauth.userinfo.get().withAuthClient(gapi.client).execute(function(err, results){
      console.log(results);
  });
  */
  //For each calendar the user has get the events
  gapi.cal.calendarList.list().withAuthClient(gapi.client).execute(function(err, myResults){
    //console.log(results);
    //{cal_id: id, {cal_sum: summary, cal_descrip: description, cal_events: [] }}
    var results = myResults['items'];
    var eventFuncs = [];
    var counter = 0;
    var resultsLength = results.length;

    for(var i = 0; i < results.length; i++){
      var cal_id = results[i]['id'];
      var cal_sum = results[i]['summary'];
      var cal_descrip = results[i]['description'];
      var cal_events= [];
      //var jsonData = {};

      if(i != (results.length - 1)){
        eventFuncs[i] = (
          function(cal_id, cal_sum, cal_descrip, cal_events, jsonData,resultsLength, res){
            return function(){
              gApiEventsCall(cal_id, cal_sum, cal_descrip, cal_events,jsonData,resultsLength, res);
            };
        })(cal_id, cal_sum, cal_descrip, cal_events,jsonData,resultsLength, res);
      }else{
        eventFuncs[i] = (
          function(cal_id, cal_sum, cal_descrip, cal_events, jsonData,resultsLength, res){
            return function(){
              gApiEventsCall(cal_id, cal_sum, cal_descrip, cal_events,jsonData,resultsLength, res);
            };
        })(cal_id, cal_sum, cal_descrip, cal_events, jsonData, resultsLength, res);
      }
    }

    //Execute the eventFuncs;
    for(var i = 0; i < results.length; i++){
        eventFuncs[i]();
    }

  });
  //console.log('End get Data');
};
