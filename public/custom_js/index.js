Parse.initialize("QuoI3WPv5g9LyP4awzhZEH8FvRKIgWgFEdFJSTmB", "lsdwkYQTwv0mTcFQWvK33gZ5ISRCCbMfPrA0AJ9j");

$(function(){
  $('#loggedInNavBar').hide();
  $('#listViewDiv').hide();
  $('#eventStartingDate').datepicker();
  //$('.datepicker').datepicker();

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
          //localteString: Sat Dec 21 08:00:00 2013
          //ddd MMM DD HH:mm:ss YYYY
          var parseDateFormat = 'ddd MMM DD HH:mm:ss YYYY';
          var displayFormat = 'dddd, MMMM Do YYYY, h:mm:ss A';
          var formattedDate = moment(parseDate, parseDateFormat).format(displayFormat);

          eventsRow.append($('<td>').text(formattedDate));
          eventsRow.append($('<td>').text(results[i].get('duration')));

          var objectId = results[i].id;
          //console.log('objectId: ' + objectId);
          var button = $('<button>').attr('class', 'btn btn-info').attr('id', objectId).text('More Info');
          button.click(function(){
            var id = $(this).attr('id');
            //console.log('id: '+id);
          }); 
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
      console.log('error: ' + error.description);
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
  //console.log('momentStartingTime: ' + momentStartingTime);
  var fiveMinsAfterNow = moment().add('minutes', 5);
  //console.log('fiveMinsAfterNow: '+ fiveMinsAfterNow);

  if(momentStartingTime.isBefore(fiveMinsAfterNow)){
    //console.log('Input time is 5 minutes before now');
    allGood = false;
    textAry.push('The Starting Time must be 5 minutes from now');
  }else{
    //console.log('Input time is good.');
  }

  if(allGood){

    var CampusEvent = Parse.Object.extend('campus_synergy');
    var campusEvent = new CampusEvent();

    console.log('campusEvent: ' + campusEvent);
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
        $('#addEventResult').append(successDiv);
      },
      error: function(campusEvent, error){
        textAry = new Array();
        textAry.push('Error adding event');
        console.log('Error: ' + error.description);
        console.log('error msg: ' + error.msg);
        console.log('error code: ' + error.code);
        var addEventErrorContainer = $('<div>').attr('class', 'alert alert-danger');
        addEventErrorContainer.append(buildErrorsTable(textAry));
        $('#addEventResult').append(addEventErrorContainer);
      }
    });

  }else{
    var addEventErrorContainer = $('<div>').attr('class', 'alert alert-danger');
    addEventErrorContainer.append(buildErrorsTable(textAry));
    $('#addEventResult').append(addEventErrorContainer);
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
          console.log("success");
          var successTbl = $('<table>').append($('<tr>').append($('<td>').text('Login Success!')));
          var successDiv = $('<div>').attr('class', 'alert alert-success').append(successTbl);
          //$('#loginResult').append(successDiv);

          $('.modal').modal('hide');
          $('#notLoggedInNavBar').hide();
          $('#loggedInNavBar').show();

        }else{
          console.log("user is not verified");

          textAry = new Array();
          textAry.push("Please verify your email address by logging into your email, and look for the subject that contains" +
           " 'Please verify your email for Campus Synergy' and follow the instructions.");

          var loginErrorContainer = $('<div>').attr('class', 'alert alert-danger');
          loginErrorContainer.append(buildErrorsTable(textAry));
          $('#loginResult').append(loginErrorContainer);
        }

      },
      error: function(user, error){
        console.log("error logging in");
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

  var signupEmail = $('#signupEmail').val();
  var signupPass = $('#signupPass').val();
  var vSignupPass = $('#vSignupPass').val();
  var orgSignupDescrip = $('#orgSignupDescrip').val();

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

    var user = new Parse.User();
    user.set("username",signupEmail);
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

function initialize() {
		var lat = 32.728987;
		var lng = -97.115008;
        var mapOptions = {
          center: new google.maps.LatLng(lat,lng),
          zoom: 14
        };
        console.log("map: " + document.getElementById("map-canvas"));
        var map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
        console.log("finished");
}
google.maps.event.addDomListener(window, 'load', initialize);