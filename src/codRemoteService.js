var Promise = require("promise");
var sanitizeHtml = require("sanitize-html");
var config = require("../config");
var _ = require("lodash");
var loginService = require("./helpers/loginService");
var alertDialog = require("./components/alert");
var isFeedbackTime = require("./isFeedbackTime");
var timeoutFetch = require("./timeoutFetch");

var URI = require("urijs");

var API_URL = URI(config.SERVICE_URL).segment("api").segment("1.0").toString();

exports.login = function(username, password) {
  var serviceUrl = URI(API_URL).segment("user").segment("login").toString();
  return exports.csrfToken()
    .then(login)
    .then(jsonify)
    .catch(log)
    .then(function(response) {
      if (response instanceof Array) {
        var error = sanitizeHtml(response[0], {allowedTags: [], allowedAttributes: []});
        return Promise.reject(error);
      }
      return response;
    })
    .catch(logoutIfAlreadyLoggedIn(username, password))
    .catch(alert);

  function login(csrfToken) {
    return timeoutFetch(serviceUrl, {
      method: "post",
      headers: {Accept: "application/json", "Content-Type": "application/json", "X-CSRF-Token": csrfToken},
      body: JSON.stringify({
        name: username,
        pass: password
      })
    });
  }
};

exports.logout = function() {
  var serviceUrl = URI(API_URL).segment("user").segment("logout").toString();
  return exports.csrfToken()
    .then(function(csrfToken) {
      return timeoutFetch(serviceUrl, {
        method: "post",
        headers: {
          Accept: "application/json", "Content-Type": "application/json", "X-CSRF-Token": csrfToken
        },
        body: "{}"
      });
    })
    .then(jsonify)
    .catch(log)
    .then(function(response) {
      if (response instanceof Array && response[0] !== true) {
        return Promise.reject(response[0]);
      }
      return response;
    })
    .catch(resolveExpiredSession)
    .catch(alert);
};

exports.csrfToken = function() {
  var serviceUrl = URI(config.SERVICE_URL).segment("services").segment("session").segment("token").toString();
  return timeoutFetch(serviceUrl).then(function(response) {
    return response.text();
  });
};

exports.evaluations = function() {
  var serviceUrl = URI(API_URL).segment("eclipsecon_evaluations").toString();
  return timeoutFetch(serviceUrl)
    .then(jsonify)
    .then(function(response) {
      if (responseIsAnErrorArray(response)) {
        return Promise.reject(response[0]);
      }
      return Promise.resolve(response);
    })
    .catch(function(e) {
      if (e.match && e.match(/Access denied/) && isFeedbackTime()) {
        loginService.destroySession();
        var error = "Session expired or evaluations service unavailable. Please log in again.";
        alert(error);
        return Promise.reject(error);
      }
      return Promise.reject(e);
    })
    .catch(function(e) {
      if (e.message && e.message.match(/request failed/)) {
        return Promise.reject(e.message);
      }
      return Promise.reject(e);
    });
};

exports.createEvaluation = function(sessionNid, comment, rating) {
  return exports.evaluations()
    .then(verifyNotAlreadyExisting(sessionNid))
    .then(exports.csrfToken)
    .then(createEvaluation(sessionNid, comment, rating))
    .then(jsonify)
    .then(verifyCreateEvaluationResponse)
    .catch(log)
    .catch(alert);
};

function logoutIfAlreadyLoggedIn(username, password) {
  return function(e) {
    if (e && e.match && e.match(/Already logged in/)) {
      return exports.logout().then(function() {
        return exports.login(username, password);
      });
    }
    return Promise.reject(e);
  };
}

function createEvaluation(sessionNid, comment, rating) {
  return function(csrfToken) {
    var serviceUrl = URI(API_URL).segment("eclipsecon_evaluations").toString();
    return timeoutFetch(serviceUrl, {
      method: "POST",
      headers: {Accept: "application/json", "Content-Type": "application/json", "X-CSRF-Token": csrfToken},
      body: JSON.stringify({session_id: sessionNid, comment: comment, rating: rating})
    });
  };
}

function responseIsAnErrorArray(response) {
  return response instanceof Array && typeof response[0] === "string";
}

function verifyNotAlreadyExisting(sessionNid) {
  return function(evaluations) {
    var alreadySubmitted = _.some(evaluations, function(evaluation) {
      return sessionNid === evaluation.nid;
    });
    if (alreadySubmitted) {
      return Promise.reject("Evaluation already submitted for this talk.");
    }
    return Promise.resolve();
  };
}

function verifyCreateEvaluationResponse(response) {
  if (responseIsAnErrorArray(response)) {
    return Promise.reject(response[0]);
  }
  if (!response.nid) {
    return Promise.reject("Could not submit evaluation.");
  }
  return Promise.resolve(response);
}

function resolveExpiredSession(e) {
  if (e === "User is not logged in.") {
    return Promise.resolve();
  }
  return Promise.reject(e);
}

function jsonify(response) {
  return response.json();
}

function log(error) {
  console.log(error.message || JSON.stringify(error));
  return Promise.reject(error);
}

function alert(error) {
  alertDialog.show(error.message || error, "Error", "OK");
  return Promise.reject(error);
}
