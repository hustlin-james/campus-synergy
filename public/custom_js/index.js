Parse.initialize("QuoI3WPv5g9LyP4awzhZEH8FvRKIgWgFEdFJSTmB", "lsdwkYQTwv0mTcFQWvK33gZ5ISRCCbMfPrA0AJ9j");

$('#forgotPwEmailBtn').click(function(){
  var forgotPwEmail = $('#forgotPwEmail').val();
  //console.log('email: '+ forgotPwEmail);

  var errorsAry = [];
  if(forgotPwEmail === '' || forgotPwEmail === null){
    errorsAry.push('Please enter an email');
  }

  if(errorsAry.length > 0){
    var resultsTbl = buildErrorsTable(errorsAry);
    var result  = $('<div>').attr('class', 'alert alert-danger').append(resultsTbl);
    $('#forgotPwResults').html(result);
  }else{
    Parse.User.requestPasswordReset(forgotPwEmail,{
      success: function(){
        //console.log('success');
        var result=$('<div>').attr('class', 'alert alert-success').append(buildErrorsTable(['Done! Please check your email.']));
        $('#forgotPwResults').html(result);
      },
      error: function(err){  
        //console.log('error');
        var errorMsg = err.message;
        var result  = $('<div>').attr('class', 'alert alert-danger').append(buildErrorsTable([errorMsg]));
        $('#forgotPwResults').html(result);
      }
    });
  }

});

var CampusSynergyCookieManipulator = {
  setCookie: function(cname,cvalue,exdays){
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  },
  getCookie: function (cname){
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
      {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
      }
    return "";
  },
  deleteCookie: function(cname){
    document.cookie=cname+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
};

//Deconstrute a moment object into 
//The date, hour, minute, and am or pm
function deconstructTime(timeMoment){
  var result = {'date':'', 'hour':'', 'minute':'', 'amorpm':''};
  result['date'] = timeMoment.format('MM/DD/YYYY');
  var timeFormatted = timeMoment.format('h:m:A');
  var valuesAry = timeFormatted.split(':');
  result['hour'] = valuesAry[0];
  result['minute'] = valuesAry[1];
  result['amorpm'] = valuesAry[2];
  //console.log();
  return result;
}

//Reformat and display the users events after retrieving them from their google
//calendar
function googleCalInitializer(googleParsedJSON){
    //console.log('googleCalJSONValue: ' + googleCalJSONValue);
    //The google calendar data has been found!
    //Create table thats displays all the events with the option to add
  var googleCalEventsObj = googleParsedJSON.googleJsonData;
  var campusSynergyUsername = googleParsedJSON.campusSynergyUsername;

  var cookieUsername = 
    $.parseJSON(CampusSynergyCookieManipulator.getCookie('campusSynergyUsername').trim()).username;

  if(campusSynergyUsername===cookieUsername){
      var allGoogleCalEvents = [];
      //Retrieve all the events from the obj
      for(var g in googleCalEventsObj){
        var gEvents = googleCalEventsObj[g].cal_events;
        //console.log(gEvents);
        //console.log('type: ' + typeof(gEvents));
        for(var i = 0; i < gEvents.length; i++){

          if(typeof gEvents[i].description === 'undefined'){
            gEvents[i].description = "";
          }

          if(typeof gEvents[i].eventSummary === 'undefined'){
            gEvents[i].eventSummary = "";
          }

          gEvents[i].fullDescription = gEvents[i].description;
          gEvents[i].fullEventSummary = gEvents[i].eventSummary;

          if(gEvents[i].description.length > 20){
            gEvents[i].description = gEvents[i].description.substr(0,20) + '...  ';
          }

          if(gEvents[i].eventSummary.length > 20){
            gEvents[i].eventSummary = gEvents[i].eventSummary.substr(0,20) + '...  ';
          }

          allGoogleCalEvents.push(gEvents[i]);
        }
      }

      //console.log('allGoogleCalEvents length: ' + allGoogleCalEvents.length);

      var googleCalEventsTbl= $('<table>');
      var googleCalEventsTblHeader = $('<thead>');
      var headerVals = ['Event Title', 'Event Description', 'Start Time', 'End Time', 'Add Event'];

      var tTemp = $('<tr>');

      for(var i = 0; i < headerVals.length; i++){
        tTemp.append($('<td>').text(headerVals[i]));
      }

      googleCalEventsTblHeader.append($('<tr>').append($('<td>').html('<b>Google Calendar Events</b>')));
      googleCalEventsTblHeader.append(tTemp);
      googleCalEventsTbl.append(googleCalEventsTblHeader);

      var tBody = $('<tbody>');
      for(var i = 0; i < allGoogleCalEvents.length; i++){
        var tRow = $('<tr>');
        //console.log(allGoogleCalEvents[i].eventSummary);
        var eventTitleFull = allGoogleCalEvents[i].fullEventSummary;
        var eventDescriptionFull = allGoogleCalEvents[i].fullDescription;

        tRow.append($('<td>').text(allGoogleCalEvents[i].eventSummary));
        tRow.append($('<td>').text(allGoogleCalEvents[i].description));

        var googleCalEventFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        var displayFormat = 'MM/DD/YY, h:mm A';
        var formattedStartDate = moment(allGoogleCalEvents[i].eventStart, googleCalEventFormat).format(displayFormat);
        //console.log('formattedDate: ' + formattedDate);
        var eventStartDate = moment(allGoogleCalEvents[i].eventStart, googleCalEventFormat);
        //console.log('eventStartData: '+eventStartDate);
        tRow.append($('<td>').text(formattedStartDate));
        var formattedEndDate = moment(allGoogleCalEvents[i].eventEnd, googleCalEventFormat).format(displayFormat);
        var eventEndDate = moment(allGoogleCalEvents[i].eventEnd, googleCalEventFormat);

        var eventDuration = eventEndDate.diff(eventStartDate,'hours');
        //console.log('eventDuration: ' + eventDuration);
        if(eventDuration < 1 || eventDuration > 24)
          eventDuration = 1;

        tRow.append($('<td>').text(formattedEndDate));
        tRow.append($('<td>').append(
            $('<button>').attr('class', 'btn btn-primary').text('Add Event').click(
              
            (function(eventTitleFull, eventDescriptionFull,eventStartDate, eventDuration){
                return function(){
                  $('#syncedCalsModal').modal('hide');
                  $('#addEvent').modal('show');

                  //Replace variable values in the addevent modal
                  $('#eventTitle').val(eventTitleFull);
                  $('#eventDescription').val(eventDescriptionFull);

                  //Retrieve the start date, start time , and attemp duration
                  //if duration is greater than 24 then set it equal to 24
                  var resultHash = deconstructTime(eventStartDate);
                  $('#eventStartingDate').val(resultHash['date']);
                  $('#eventStartHour').val(resultHash['hour']);
                  $('#eventStartMinute').val(resultHash['minute']);
                  $('#eventStartAmOrPM').val(resultHash['amorpm']);
                  $('#eventDuration').val(eventDuration);

                };
            })(eventTitleFull, eventDescriptionFull, eventStartDate, eventDuration)
        )));

        tBody.append(tRow);
      }

      googleCalEventsTbl.append(tBody);
      $('#googleCalEventsModalBody').append(googleCalEventsTbl);
  }
}

//Reformat and display the users events after retrieving them from facebook
function fbEventsInitializer(fbParsedJSON){
    //console.log(fbEventsJSONValue);
    var fbEventsObj = fbParsedJSON.allFbEventsProcessed;
    var campusSynergyUsername = fbParsedJSON.campusSynergyUsername;

    var cookieUsername = 
      $.parseJSON(CampusSynergyCookieManipulator.getCookie('campusSynergyUsername').trim()).username;

    if(campusSynergyUsername === cookieUsername){
      var headerVals = ['Event Title', 'Event Description', 'Start Time', 'End Time', 'Add Event'];
      var fbTable = $('<table>');
      var tblHeader = $('<thead>');
      var tblBody = $('<tbody>');
      var tblHeaderRow = $('<tr>');

      for(var i = 0; i < headerVals.length; i++){
        tblHeaderRow.append($('<td>').text(headerVals[i]));
      }      

      tblHeader.append($('<tr>').append($('<td>').html('<b>Facebook Events</b>')));
      tblHeader.append(tblHeaderRow);
      fbTable.append(tblHeader);

      for(var f in fbEventsObj){
        var fObj = fbEventsObj[f];
        var eventTitle = '';
        var eventDescription = '';
        var eventStartTime = '';
        var eventTitleFull ='';
        var eventDescriptionFull='';
        var tblRow = $('<tr>');

        if(typeof fObj['name'] !== 'undefined'){
          eventTitle = fObj['name'];
          eventTitleFull = eventTitle;
        }

        if(typeof fObj['description'] !== 'undefined'){
          eventDescription = fObj['description'];
          eventDescriptionFull = eventDescription;
        }

        if(typeof fObj['start_time'] !== 'undefined')
          eventStartTime = fObj['start_time'];

        if(eventTitle.length > 20)
          eventTitle = eventTitle.substr(0,20) + '...';

        if(eventDescription.length > 20)
          eventDescription = eventDescription.substr(0,20) + '...';

        tblRow.append($('<td>').text(eventTitle));
        tblRow.append($('<td>').text(eventDescription));

        var fbEventFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        var displayFormat = 'MM/DD/YY, h:mm A';
        var momentDateStart = moment(eventStartTime, fbEventFormat);
        var formattedDate = momentDateStart.format(displayFormat);
        var endDate = moment(eventStartTime, fbEventFormat).add('hours', 1).format(displayFormat);

        tblRow.append($('<td>').text(formattedDate));
        tblRow.append($('<td>').text(endDate));
        tblRow.append($('<td>').append(
            $('<button>').attr('class', 'btn btn-primary').text('Add Event').click(
              
            (function(eventTitleFull, eventDescriptionFull, momentDateStart){
                return function(){
                  $('#syncedCalsModal').modal('hide');
                  $('#addEvent').modal('show');

                  //Replace variable values in the addevent modal
                  $('#eventTitle').val(eventTitleFull);
                  $('#eventDescription').val(eventDescriptionFull);

                  //return value: {'date':'', 'hour':'', 'minute':'', 'amorpm':''};
                  var resultHash = deconstructTime(momentDateStart);
                  $('#eventStartingDate').val(resultHash['date']);
                  $('#eventStartHour').val(resultHash['hour']);
                  $('#eventStartMinute').val(resultHash['minute']);
                  $('#eventStartAmOrPM').val(resultHash['amorpm']);

                };
            })(eventTitleFull, eventDescriptionFull, momentDateStart)
        )));
        tblBody.append(tblRow);
      }
      fbTable.append(tblBody);

      $('#fbCalEventsModalBody').append(fbTable);
    }
}

$(function(){

  //document.cookie='username=Test';

  $('#loggedInNavBar').hide();
  $('#listViewDiv').hide();
  $('#eventStartingDate').datepicker();
  //$('.datepicker').datepicker();
  var currentUser = Parse.User.current();
  if(currentUser){
    $('#notLoggedInNavBar').hide();
    $('#loggedInNavBar').show();
    var fbEventsJSONValue = $('#fbEventsJSON').val();
    var googleCalJSONValue = $('#googleCalJSON').val();

    var numFbEvents = 0;
    var numGoogleCalEvents = 0;
    //Check the username property in the synced events JSON
    //and if they don't match then reset the values
    //It also compares the values again in the functions
    var cookieUsername = 
      $.parseJSON(CampusSynergyCookieManipulator.getCookie('campusSynergyUsername').trim()).username;
      
    //console.log('googleCalJSONValue: '+googleCalJSONValue);
    if(googleCalJSONValue && googleCalJSONValue !==''){
      var googleParsedJSON = $.parseJSON(googleCalJSONValue);
      var googleCalEventsObj=googleParsedJSON.googleJsonData;

      for(var g in googleCalEventsObj){
        numGoogleCalEvents += googleCalEventsObj[g].cal_events.length;
      }
      if(cookieUsername !== googleParsedJSON.campusSynergyUsername){
        //console.log('cookie and thing dont match');
        googleCalJSONValue=null;
        $('#googleCalJSON').val('');
      }else{
        googleCalInitializer(googleParsedJSON);
      }
    }

    if(fbEventsJSONValue && fbEventsJSONValue !== ''){
      var fbParsedJSON = $.parseJSON(fbEventsJSONValue);
      numFbEvents = fbParsedJSON.allFbEventsProcessed.length;
      if(cookieUsername !== fbParsedJSON.campusSynergyUsername){
        //console.log(fbEventsJSONValue);
        fbEventsJSONValue=null;
        $('#fbEventsJSON').val('');
      }else{
        fbEventsInitializer(fbParsedJSON);
      }
    }

    //Check that if either the google json or facebook json is not null
    if( (fbEventsJSONValue !== null && numFbEvents > 0) || (googleCalJSONValue !== null && numGoogleCalEvents>0)){
      $('#syncedCalsModal').modal('show');
      var addEventModal = $('#addEvent.modal-footer');
      //Add a button in the add events to see the synced events
      var mySyncedEventsBtn 
        = $('<button>').attr('class', 'btn btn-primary').text('Synced Events').click(
          function(){
            //console.log('Synced Events Btn clicked.');
            $('.modal').modal('hide');
            $('#syncedCalsModal').modal('show');
          });

      $('#addEventsFooter').append(mySyncedEventsBtn);
    }

  }

});

//takes an array of string of errors, and creates
//a table out of it for displaying purposes
function buildErrorsTable(textAry){
  var errorsTable = $('<table>');

  for(var i=0;i < textAry.length; i++){
    var row = $('<tr>').append($('<td>').text(textAry[i]));
    errorsTable.append(row);
  }
  return errorsTable;
}

$('#contactUs').click(function(){
  //Sends the email
  var contactUsSubject = $('#contactUsSubject').val();
  var contactUsFromEmail = $('#contactUsFromEmail').val();
  var contactUsBody = $('#contactUsBody').val();

  var textAry = [];
  if(contactUsSubject === '')
    textAry.push('Please enter subject');
  if(contactUsBody === '')
    textAry.push('Please enter the body');

  var errorsTbl = buildErrorsTable(textAry);
  $('#contactUsResult').append(errorsTbl);

  var formData = {'contactUsSubject': contactUsSubject, 
  'contactUsFromEmail':contactUsFromEmail,
  'contactUsBody':contactUsBody};

});

$('#logoutBtn').click(function(){
  var currentUser = Parse.User.current(); 

  if(currentUser != null){
    Parse.User.logOut();
    $('.modal').modal('hide');
    $('#notLoggedInNavBar').show();
    $('#loggedInNavBar').hide();
    CampusSynergyCookieManipulator.deleteCookie('campusSynergyUsername');
  }

});

$('#listViewBtn').click(function(){

  var CampusEvents = Parse.Object.extend('campus_synergy');
  var query = new Parse.Query(CampusEvents);

  query.find({
    success: function(results){
        var eventsTable = $('<table>').attr('class', 'table table-striped');
        var tHeadsArray = ['Title', 'Building', 'Room', 'Start Time', 'Duration', 'More Information'];
        var tHeadsCols = $('<tr>');
        for(var i = 0; i < tHeadsArray.length; i++){
          tHeadsCols.append( $('<td>').text(tHeadsArray[i]));
        }
        eventsTable.append($('<thead>').append(tHeadsCols));

        var eventsBody = $('<tbody>');
      
        for(var i = 0; i < results.length; i++){
          var eventsRow = $('<tr>');
          eventsRow.append($('<td>').text(results[i].get('title')));
          eventsRow.append($('<td>').text(results[i].get('bldName')));
          eventsRow.append($('<td>').text(results[i].get('roomString')));
          var parseDate = results[i].get('date').toLocaleString();
          //There may be browsers formatting the date string differently....
          //localteString: Sat Dec 21 08:00:00 2013
          //ddd MMM DD HH:mm:ss YYYY

          //Safari:
          //parseDate: January 23, 2014 at 5:07:52 PM CST (index.js, line 426)
          //MMMM DD, YYYY at H:mm:ss A z

          var parseDateFormat = 'ddd MMM DD HH:mm:ss YYYY';
          var displayFormat = 'dddd, MMMM Do YYYY, h:mm:ss A';
          var startDate = moment(parseDate, parseDateFormat).format(displayFormat);

          //Try to parse the date in a different format
          if(startDate === 'Invalid date'){
            var safariDateFormat = 'MMMM DD, YYYY at HH:mm:ss A z';
            startDate = moment(parseDate, safariDateFormat).format(displayFormat);
          }

          eventsRow.append($('<td>').text(startDate));
          eventsRow.append($('<td>').text(results[i].get('duration')));

          var objectId = results[i].id;
          //console.log('objectId: ' + objectId);
          var button = $('<button>').attr('class', 'btn btn-info').attr('id', objectId).text('More Info');
          var anEvent = results[i];
          anEvent['roomString'] = results[i].get('roomString');
          anEvent['bldName'] = results[i].get('bldName');
          anEvent['duration'] = results[i].get('duration');
          anEvent['longDescription'] = results[i].get('longDescription');
          anEvent['publisher'] = results[i].get('publisher');
          anEvent['title'] = results[i].get('title');

          function eventsAppend(anEvent){
            return function(){
              var eTable = $('<table>');
            
              eTable.append($('<tr>').append($('<td>').text("Room Number: ")).append($('<td>').text(anEvent['roomString'])));
              eTable.append($('<tr>').append($('<td>').text("Building: ")).append($('<td>').text(anEvent['bldName'])));
              eTable.append($('<tr>').append($('<td>').text("Start Time: ")).append($('<td>').text(startDate)));
              eTable.append($('<tr>').append($('<td>').text("Duration: ")).append($('<td>').text(anEvent['duration'])));
              eTable.append($('<tr>').append($('<td>').text("Description: ")).append($('<td>').text(anEvent['longDescription'])));
              eTable.append($('<tr>').append($('<td>').text("Creator: ")).append($('<td>').text(anEvent['publisher'])));

              //Don't use .html it will cause script injection 
              //$('#moreEventsHeader').html( '<h4>' + 'Event: ' + anEvent['title'] + '</h4>');
              //$('#moreEventsBody').html(eTable);

              $('#moreEventsHeader').empty();
              $('#moreEventsBody').empty();

              $('#moreEventsHeader').append($('<h4>').text('Event: ' + anEvent['title']));
              $('#moreEventsBody').append(eTable);

              $('#moreEventsModal').modal('show');
            }
          }

          button.click(eventsAppend(anEvent)); 

          eventsRow.append($('<td>').append(button));
          eventsBody.append(eventsRow);
        }
        eventsTable.append(eventsBody);
        $('#listViewDiv').empty();
        $('#listViewDiv').append(eventsTable);
        $('#map-canvas').hide();
        $('#listViewDiv').show();
    },
    error: function(error){
      //console.log('error: ' + error.description);
    }
  });

});

$('#mapViewBtn').click(function(){
  $('#listViewDiv').hide();
  $('#map-canvas').show();
}); 

//Check that all the event information have
//been enter and are validate
$('#addEventBtn').click(function(){
  var allGood = true;
  var textAry = new Array();

  var eventTitle = $('#eventTitle').val();
  var eventDescription = $('#eventDescription').val();
  var eventBuilding = $('#eventBuilding').val();
  var eventRoomNumber = $('#eventRoomNumber').val();
  var eventStartingDate = $('#eventStartingDate').val();
  var eventStartHour = $('#eventStartHour').val();
  var eventStartMinute = $('#eventStartMinute').val();
  var eventStartAmOrPM = $('#eventStartAmOrPM').val();
  var eventDuration = $('#eventDuration').val();

  if(eventTitle == null || eventTitle == ''){
    allGood = false;
    textAry.push('Please enter an event title');
  }

  if(eventDescription==null || eventDescription==''){
    allGood = false;
    textAry.push('Please enter an event description');
  }

  if(eventBuilding==null || eventBuilding == ''){
    allGood = false;
    textAry.push('Please enter an event building');
  }

  if(eventRoomNumber==null || eventRoomNumber == ''){
    allGood = false;
    textAry.push('Please enter an event room number');
  }

  if(eventDuration == null || eventDuration =='' ){
    allGood = false;
    textAry.push('Please enter an event duration');
  }

  var startingTimeString = eventStartingDate+' '+eventStartHour+':'+eventStartMinute+' '+eventStartAmOrPM;
  var startingTimeFormat = "MM/DD/YYYY h:m a"
  //console.log('startingTimeString: ' + startingTimeString);

  var momentStartingTime = moment(startingTimeString, startingTimeFormat);
  var fiveMinsAfterNow = moment().add('minutes', 5);

  if(momentStartingTime.isBefore(fiveMinsAfterNow)){
    //console.log('Input time is 5 minutes before now');
    allGood = false;
    textAry.push('The Starting Time must be 5 minutes from now');
  }else{
    //console.log('Input time is good.');
  }

  if(allGood){

    //Check that the user is logged in before doing this
    var currentUser = Parse.User.current();

    if(currentUser){
      
      var CampusEvent = Parse.Object.extend('campus_synergy');
      var campusEvent = new CampusEvent();

      //console.log('campusEvent: ' + campusEvent);
      campusEvent.set('bldName', eventBuilding);
      //campusEvent.set('date', momentStartingTime);
      campusEvent.set('date', new Date(startingTimeString));
      campusEvent.set('duration', parseInt(eventDuration));
      campusEvent.set('longDescription', eventDescription);
      campusEvent.set('roomString', eventRoomNumber);
      campusEvent.set('publisher', Parse.User.current().getUsername());
      campusEvent.set('title', eventTitle);

      campusEvent.save(null, {
        success: function(campusEvent){
          var successTbl = $('<table>').append($('<tr>').append($('<td>').text('Successfully added the event.')));
          var successDiv = $('<div>').attr('class', 'alert alert-success').append(successTbl);
          $('#addEventResult').html(successDiv);

          //Reset all the fields
          $('#eventTitle').val('');
          $('#eventDescription').val('');
          $('#eventBuilding').val('AL');
          $('#eventRoomNumber').val('');
          $('#eventStartingDate').val('');
          $('#eventStartHour').val('8');
          $('#eventStartMinute').val('0');
          $('#eventStartAmOrPM').val('AM');
          $('#eventDuration').val('1');       

        },
        error: function(campusEvent, error){
          textAry = new Array();
          textAry.push('Error adding event');
          //console.log('Error: ' + error.description);
          //console.log('error msg: ' + error.msg);
          //console.log('error code: ' + error.code);
          var addEventErrorContainer = $('<div>').attr('class', 'alert alert-danger');
          addEventErrorContainer.append(buildErrorsTable(textAry));
          $('#addEventResult').html(addEventErrorContainer);
        }
      });
    }else{
      var addEventErrorContainer = $('<div>').attr('class', 'alert alert-danger');
      addEventErrorContainer.append(buildErrorsTable(['You must be logged in to add events.']));
      $('#addEventResult').html(addEventErrorContainer);
    }

  }else{
    var addEventErrorContainer = $('<div>').attr('class', 'alert alert-danger');
    addEventErrorContainer.append(buildErrorsTable(textAry));
    $('#addEventResult').html(addEventErrorContainer);
  }

});

$('#loginBtn').click(function(){
  var allGood = true;
  var textAry = new Array();

  var loginEmail = $('#loginEmail').val();
  var loginPass = $('#loginPass').val();

  if(loginEmail == null || loginEmail == ''){
    allGood = false;
    textAry.push('Please enter an email');
  }

  if(loginPass == null || loginPass == ''){
    allGood = false;
    textAry.push('Please enter a password');
  }

  $('#loginResult').empty();
  if(allGood){

    Parse.User.logIn(loginEmail, loginPass, {
      success: function(user){

        if(user.get("emailVerified")){
          //console.log("success");
          var successTbl = $('<table>').append($('<tr>').append($('<td>').text('Login Success!')));
          var successDiv = $('<div>').attr('class', 'alert alert-success').append(successTbl);
          //$('#loginResult').html(successDiv);

          //setCookie: function(cname,cvalue,exdays)
          CampusSynergyCookieManipulator.setCookie('campusSynergyUsername',
            JSON.stringify({'username':user.get('username')}),1);

          //document.cookie=JSON.stringify({'username':user.get('username')});

          $('.modal').modal('hide');
          $('#notLoggedInNavBar').hide();
          $('#loggedInNavBar').show();

        }else{
          //console.log("user is not verified");

          textAry = new Array();
          textAry.push("Please verify your email address by logging into your email, and look for the subject that contains" +
           " 'Please verify your email for Campus Synergy' and follow the instructions.");

          var loginErrorContainer = $('<div>').attr('class', 'alert alert-danger');
          loginErrorContainer.append(buildErrorsTable(textAry));
          $('#loginResult').append(loginErrorContainer);
        }

      },
      error: function(user, error){
        var textAry = ['Error Logging in. Make sure you entered your username and password correctly.'];
        var loginErrorContainer = $('<div>').attr('class', 'alert alert-danger');
        loginErrorContainer.append(buildErrorsTable(textAry));
        $('#loginResult').append(loginErrorContainer);
      }
    })

  
  }else{      
    var loginErrorContainer = $('<div>').attr('class', 'alert alert-danger');
    loginErrorContainer.append(buildErrorsTable(textAry));
    $('#loginResult').append(loginErrorContainer);
  }

});

$('#signupBtn').click(function(){
  var allGood = true;
  var textAry = new Array();

  var signupUsername = $('#signupUsername').val();
  var signupEmail = $('#signupEmail').val();
  var signupPass = $('#signupPass').val();
  var vSignupPass = $('#vSignupPass').val();
  var orgSignupDescrip = $('#orgSignupDescrip').val();

  if(signupUsername === null || signupUsername === ''){
    textAry.push('Please enter an username');
  }

  if(signupEmail == null || signupEmail==''){
    textAry.push('Please enter an email');
  }

  if(signupPass == null || signupPass == ''){
    textAry.push('Please enter a password');
  }

  if(vSignupPass == null || vSignupPass == ''){
    textAry.push('Please verify your password');
  }

  if(signupPass != vSignupPass){
    textAry.push("Passwords don't match");
  }

  if(orgSignupDescrip==null || orgSignupDescrip==''){
    textAry.push('Please enter an organization description');
  }

  $('#signupResult').empty();
  if(allGood){

    function resetAllSignupFields(){
      $('#signupUsername').val('');
      $('#signupEmail').val('');
      $('#signupPass').val('');
      $('#vSignupPass').val('');
      $('#orgSignupDescrip').val('');
    }

    var user = new Parse.User();
    user.set("username",signupUsername);
    user.set("password", signupPass);
    user.set("email", signupEmail);
    user.set("orgDescrip", orgSignupDescrip);

    user.signUp(null, {
      success:function(user){

        console.log("user was signup successfully");
        console.log("username: " + user.getUsername());

        var successTbl = $('<table>').append($('<tr>').append($('<td>').text('Signup Successful! Please check your email to activate your account.')));
        var successDiv = $('<div>').attr('class', 'alert alert-success').append(successTbl);
        $('#signupResult').append(successDiv);

        resetAllSignupFields();

      }, 
      error: function(user, error){

        console.log("Error: " + error.code + " " + error.message);

        textAry = new Array();
        textAry.push(error.message);

        var signupErrorContainer = $('<div>').attr('class', 'alert alert-danger');
        signupErrorContainer.append(buildErrorsTable(textAry));
        $('#signupResult').append(signupErrorContainer);

      }
    });

  }else{      
    var signupErrorContainer = $('<div>').attr('class', 'alert alert-danger');
    signupErrorContainer.append(buildErrorsTable(textAry));
    $('#signupResult').append(signupErrorContainer);
  }

});

//Creates the google map along with the overlays and their listeners
function initialize() {
		var lat = 32.728987;
		var lng = -97.115008;
        var mapOptions = {
          center: new google.maps.LatLng(lat,lng),
          zoom: 16
        };
        console.log("map: " + document.getElementById("map-canvas"));
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
        console.log("finished");

      var CampusEvents = Parse.Object.extend('campus_synergy');
      var query = new Parse.Query(CampusEvents);

      query.find({
        success: function(results){
          $.getJSON('/buildings_json', function(data){

            //return true if eventtime is less than now
            function checkIfEventTimeLessThanNow(eventTime){
               var now = moment();
               var parseDateFormat = 'ddd MMM DD HH:mm:ss YYYY';
               var displayFormat = 'MM-DD-YYYY, h:mm:ss A';
               var testForInvalid = moment(eventTime.toLocaleString(), parseDateFormat).format(displayFormat);
               var parseMomentDate = moment(eventTime.toLocaleString(), parseDateFormat);
               console.log('parseMomentDate: '+ parseMomentDate);
              
               if(testForInvalid === 'Invalid date'){
                 var safariDateFormat = 'MMMM DD, YYYY at HH:mm:ss A z';
                 parseMomentDate = moment(eventTime.toLocaleString(), safariDateFormat);
                 console.log('parseMomentDate safari: '+parseMomentDate);
               }

               if(parseMomentDate.isBefore(now)){
                console.log('true');
                return true;
               }
               return false;
            }

            var buildingsJSONHash = {};

            for(var i=0; i < data.length; i++){
              buildingsJSONHash[data[i]['name']] = data[i]['coordinates'];
            }

            //This holds the overlays that needs to be drawn for each building
            var mapOverlayHash = {};

            for(var i=0; i < results.length; i++){
              //This makes sure that only one instance of the building coordinates exists
              if(buildingsJSONHash[results[i].get('bldName')] != null){
                //console.log('coordinates: ' + buildingsJSONHash[results[i].get('bldName')]);
                var coordinates = buildingsJSONHash[results[i].get('bldName')];
                
                if(mapOverlayHash[results[i].get('bldName')] == null){
                  var aHash = {};
                  aHash['coordinates'] = coordinates;
                  mapOverlayHash[results[i].get('bldName')] = aHash;
                  //console.log('coordinates: ' + mapOverlayHash[results[i].get('bldName')]);
                }

                if(mapOverlayHash[results[i].get('bldName')]['bldEventsArray'] == null){
                  var eventsArray = [];
                  var eventHash = {};

                  eventHash['id'] = results[i].id;
                  eventHash['date'] = results[i].get('date');
                  eventHash['duration'] = results[i].get('duration');
                  eventHash['longDescription'] = results[i].get('longDescription');
                  eventHash['publisher'] = results[i].get('publisher');
                  eventHash['roomString'] = results[i].get('roomString');
                  eventHash['title'] = results[i].get('title');
                  eventHash['bldName'] = results[i].get('bldName');

                  //if date is less than current time then don't add it
                  if(!checkIfEventTimeLessThanNow(eventHash['date'])){
                    eventsArray.push(eventHash);
                  }
                  mapOverlayHash[results[i].get('bldName')]['bldEventsArray'] = eventsArray;
                }else{
                  var eventHash = {};
                  eventHash['id'] = results[i].id;
                  eventHash['date'] = results[i].get('date');
                  eventHash['duration'] = results[i].get('duration');
                  eventHash['longDescription'] = results[i].get('longDescription');
                  eventHash['publisher'] = results[i].get('publisher');
                  eventHash['roomString'] = results[i].get('roomString');
                  eventHash['title'] = results[i].get('title');
                  eventHash['bldName'] = results[i].get('bldName');

                  //if date is less than current time then don't add it
                  if(!checkIfEventTimeLessThanNow(eventHash['date'])){
                    mapOverlayHash[results[i].get('bldName')]['bldEventsArray'].push(eventHash);
                  }
                }
             
              }
            }

            //Check the mapOverlayHash for buildings that have 0 events after being processed
            for(var bld in mapOverlayHash){
              if(mapOverlayHash[bld].bldEventsArray.length === 0){
                delete mapOverlayHash[bld];
              }
            }

           
            //myValues is a Hash that contains, {'coordinates':anArray, 'bldEventsArray':eventsArrayHash}
            $.each(mapOverlayHash, function(key, myValues){

              var polyCoords = [];
              var value = myValues['coordinates'];
              for(var i =0; i < value.length; i++){
                //console.log('lat: ' + value[i]['lat']);
                //console.log('lng: ' + value[i]['lng']);
                polyCoords.push(new google.maps.LatLng(value[i]['lat'], value[i]['lng']));
              }

             var mapPolygons = [];
              mapPolygons.push(new google.maps.Polygon({
                paths: polyCoords,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35
              }));
              

              for(var i =0; i < mapPolygons.length; i++){
                mapPolygons[i].setMap(map);

                var eventsArray = [];
                var polygonProperty = {
                  'bldName':key,
                  'eventsList': myValues['bldEventsArray']
                };

                var aPolygon = mapPolygons[i];
                aPolygon.polygonPrpty = polygonProperty;

                google.maps.event.addListener(aPolygon, 'click',
                  function(event){ 
                    //alert('bldName: ' + aPolygon.polygonPrpty['bldName'] + ', num events: ' + aPolygon.polygonPrpty['eventsList'].length);
                    //console.log(aPolygon.polygonPrpty['eventsList']);
                    var eventsTable = $('<table>').attr('class', 'table table-striped');
                    var eventsHeader = ['Title', 'Room', 'Start Time', 'Duration', 'More Info'];
                    var tHead = $('<thead>');

                    var tHeadRow = $('<tr>'); 
                    for(var i =0; i < eventsHeader.length; i++){
                      tHeadRow.append($('<td>').text(eventsHeader[i]));
                    } 
                    tHead.append(tHeadRow);

                    var eventsList = aPolygon.polygonPrpty['eventsList'];
                    console.log(eventsList);
                    var tBody = $('<tbody>');
                    for(var i = 0; i < eventsList.length; i++){

                      if(eventsList[i]['title'].length > 15){
                        eventsList[i]['title']=eventsList[i]['title'].substr(0,15) +'...';
                      }

                      if(eventsList[i]['roomString'].length > 15){
                        eventsList[i]['roomString']=eventsList[i]['roomString'].substr(0,15)+'...';
                      }

                      var aRow = $('<tr>');
                      aRow.append($('<td>').text(eventsList[i]['title']));
                      aRow.append($('<td>').text(eventsList[i]['roomString']));

                      var parseDateFormat = 'ddd MMM DD HH:mm:ss YYYY';
                      var displayFormat = 'MM-DD-YYYY, h:mm:ss A';
                      var formattedDate = moment(eventsList[i]['date'].toLocaleString(), parseDateFormat).format(displayFormat); 
                      
                      if(formattedDate === 'Invalid date'){
                        var safariDateFormat = 'MMMM DD, YYYY at HH:mm:ss A z';
                        formattedDate = moment(eventsList[i]['date'].toLocaleString(), safariDateFormat).format(displayFormat); 
                      }

                      aRow.append($('<td>').text(formattedDate));

                      aRow.append($('<td>').text(eventsList[i]['duration']));

                      var objectId = eventsList[i]['id'];
                      //console.log('objectId: ' + objectId);
                      var button = $('<button>').attr('class', 'btn btn-info').attr('id', objectId).text('More Info');
                      var anEvent = eventsList[i];
                      
                      button.click(function(){
                        var id = $(this).attr('id');
                        //console.log('id: '+id);
                        console.log('events List: ' + eventsList.length);

                        var eTable = $('<table>');
                        
                        eTable.append($('<tr>').append($('<td>').text("Room Number: ")).append($('<td>').text(anEvent['roomString'])));
                        eTable.append($('<tr>').append($('<td>').text("Building: ")).append($('<td>').text(anEvent['bldName'])));
                        eTable.append($('<tr>').append($('<td>').text("Start Time: ")).append($('<td>').text(formattedDate)));
                        eTable.append($('<tr>').append($('<td>').text("Duration: ")).append($('<td>').text(anEvent['duration'])));
                        eTable.append($('<tr>').append($('<td>').text("Description: ")).append($('<td>').text(anEvent['longDescription'])));
                        eTable.append($('<tr>').append($('<td>').text("Creator: ")).append($('<td>').text(anEvent['publisher'])));


                        //$('#moreEventsHeader').html( '<h4>' + 'Event: ' + anEvent['title'] + '</h4>');
                        $('#moreEventsHeader').empty();
                        $('#moreEventsBody').empty();

                        $('#moreEventsHeader').append($('<h4>').text('Event: '+anEvent['title']));
                        $('#moreEventsBody').append(eTable);
                        $('#moreEventsModal').modal('show');

                      }); 

                      aRow.append($('<td>').append(button));
                      tBody.append(aRow);
                    }

                    eventsTable.append(tHead);
                    eventsTable.append(tBody);

                    //$('#overlayEventsListHeader').html('<h4>' + 'Events for ' + aPolygon.polygonPrpty['bldName'] + '</h4>');
                    //$('#overlayEventsListBody').html(eventsTable);

                    $('#overlayEventsListHeader').empty();
                    $('#overlayEventsListBody').empty();

                    $('#overlayEventsListHeader').append($('<h4>').text('Events for ' + aPolygon.polygonPrpty['bldName']));
                    $('#overlayEventsListBody').append(eventsTable);

                    $('#overlayEventsList').modal('show');

                });
              }
            });

          });

        },
        error: function(error){
      }});
}
google.maps.event.addDomListener(window, 'load', initialize);