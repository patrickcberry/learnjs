'use strict';

var learnjs = {};

/** ***********************************************************

	AUTHENTICATION

*/

var learnjs = {
  poolId: 'ap-southeast-2:67324cbc-7eb5-4333-9633-86566ad88d8e'
};

learnjs.identity = new $.Deferred();

function googleSignIn(googleUser) {
  var id_token = googleUser.getAuthResponse().id_token;
  AWS.config.update({
    region: 'ap-southeast-2',
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: learnjs.poolId,
      Logins: {
        'accounts.google.com': id_token
      }
    })
  })
  function refresh() {
    return gapi.auth2.getAuthInstance().signIn({
        prompt: 'login'
      }).then(function(userUpdate) {
      var creds = AWS.config.credentials;
      var newToken = userUpdate.getAuthResponse().id_token;
      creds.params.Logins['accounts.google.com'] = newToken;
      return learnjs.awsRefresh();
    });
  }
  learnjs.awsRefresh().then(function(id) {
    learnjs.identity.resolve({
      id: id,
      email: googleUser.getBasicProfile().getEmail(),
      refresh: refresh
    });
  });
}

learnjs.awsRefresh = function() {
  var deferred = new $.Deferred();
  AWS.config.credentials.refresh(function(err) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(AWS.config.credentials.identityId);
    }
  });
  return deferred.promise();
}

/** ***********************************************************

	PROFILE VIEW

*/

learnjs.profileView = function() {
  var view = learnjs.template('profile-view');
  learnjs.identity.done(function(identity) {
    view.find('.email').text(identity.email);
  });
  return view;
}

learnjs.addProfileLink = function(profile) {
  var link = learnjs.template('profile-link');
  link.find('a').text(profile.email);
  $('.signin-bar').prepend(link);
}

/** ***********************************************************

		

*/

//learnjs.googleClientId = '279199844206-ih5taj72mn8fnr12n39sl38ii22sd9na.apps.googleusercontent.com';
//learnjs.googleClientSecrect = 'mRo1NZNPVnSZ4CzHJ5rpYjQr';

learnjs.problems = [
	{
		description: "What is truth?",
		code: "function problem() { return __; }"
	},
	{
		description: "Simple Math",
		code: "function problem() { return 42 === 6 * __; }"
	}
];



learnjs.landingView = function() {
	return learnjs.template('landing-view');
}


learnjs.buildCorrectFlash = function (problemNum) {
  var correctFlash = learnjs.template('correct-flash');
  var link = correctFlash.find('a');
  if (problemNum < learnjs.problems.length) {
    link.attr('href', '#problem-' + (problemNum + 1));
  } else {
    link.attr('href', '');
    link.text("You're Finished!");
  }
  return correctFlash;
}

learnjs.problemView = function(data) {
  var problemNumber = parseInt(data, 10);
  var view = $('.templates .problem-view').clone();
  var problemData = learnjs.problems[problemNumber - 1]; 
  var resultFlash = view.find('.result'); 

  function checkAnswer() { 
    var answer = view.find('.answer').val();
    var test = problemData.code.replace('__', answer) + '; problem();';
    return eval(test);
  }

  function checkAnswerClick() { 
    if (checkAnswer()) {
      //resultFlash.text('Correct!');
      //learnjs.flashElement(resultFlash,'Correct!');
      var correctFlash = learnjs.buildCorrectFlash(problemNumber);
      //correctFlash.find('a').attr('href', '#problem-' + (problemNumber+1));
      learnjs.flashElement(resultFlash,correctFlash);      
    } else {
      //resultFlash.text('Incorrect!');
      learnjs.flashElement(resultFlash,'Incorrect!');
    }
    return false;
  }

  if (problemNumber < learnjs.problems.length) {
    var buttonItem = learnjs.template('skip-btn');
    buttonItem.find('a').attr('href', '#problem-' + (problemNumber + 1));
    $('.nav-list').append(buttonItem);
    view.bind('removingView', function() {
      buttonItem.remove();
    });
  }

  view.find('.check-btn').click(checkAnswerClick); 
  view.find('.title').text('Problem #' + problemNumber);
  learnjs.applyObject(problemData, view);
  return view;
}

learnjs.template = function(name){
	return $('.templates .' + name).clone();
};

/**
learnjs.problemView = function(data) {
	
	var problemNumber = parseInt(data,10);
	//var title = 'Problem #' + problemNumber + ' Coming soon!';

	var view = $('.templates .problem-view').clone();
	view.find('.title').text('Problem #' + problemNumber);
	learnjs.applyObject(learnjs.problems[problemNumber-1],view)

	return view;
};
*/

learnjs.triggerEvent = function(name,args){
	$('.view-container>*').trigger(name,args);
}


learnjs.showView = function(hash) {
	var routes = {
		'': learnjs.landingView,
		'#': learnjs.landingView,
		'#landing': learnjs.landingView,
		'#problem': learnjs.problemView,
		'#profile': learnjs.profileView
	};

	var hashParts = hash.split('-');
	var viewFn = routes[hashParts[0]];

	if ( viewFn ) {
		learnjs.triggerEvent('removingView', []);
		$('.view-container').empty().append(viewFn(hashParts[1]));		
	}

};

learnjs.appOnReady = function(){

	window.onhashchange = function(){
		learnjs.showView(window.location.hash);
	};

	learnjs.showView(window.location.hash);
	learnjs.identity.done(learnjs.addProfileLink);
};

learnjs.applyObject = function(obj, elem){
	for (var key in obj) {
		elem.find('[data-name="' + key + '"]').text(obj[key]);
	}
};

learnjs.flashElement = function(elem, content) {
  elem.fadeOut('fast', function() {
    elem.html(content);
    elem.fadeIn();
  });
};

