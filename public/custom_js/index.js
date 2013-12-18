Parse.initialize("QuoI3WPv5g9LyP4awzhZEH8FvRKIgWgFEdFJSTmB", "lsdwkYQTwv0mTcFQWvK33gZ5ISRCCbMfPrA0AJ9j");

$(function(){
  $('#loggedInNavBar').hide();
  $('#listViewDiv').hide();
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
  $('#map-canvas').hide();
  $('#listViewDiv').show();
});

$('#mapViewBtn').click(function(){
  $('#listViewDiv').hide();
  $('#map-canvas').show();
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