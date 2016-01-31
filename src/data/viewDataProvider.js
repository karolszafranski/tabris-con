var Promise = require("promise");
var viewDataAdapter = require("../data/viewDataAdapter");
var DataExtractor = require("../data/DataExtractor");
var dataLoader = require("../data/dataLoader");
var config = require("../../config");
var _ = require("lodash");

var conferenceData;
var dataExtractor;

exports.getPreviewCategories = function() {
  var previewCategories = getDataExtractor().extractPreviewCategories();
  return viewDataAdapter.adaptPreviewCategories(previewCategories);
};

exports.getCategory = function(categoryId) {
  var categories = getDataExtractor().extractCategories();
  var category = _.find(categories, function(category) {return category.id === categoryId;});
  return viewDataAdapter.adaptCategory(category);
};

exports.getSession = function(sessionId) {
  var sessions = getDataExtractor().extractSessions();
  var session = _.find(sessions, function(session) {
    return session.id === sessionId;
  });
  return viewDataAdapter.adaptSession(session);
};

exports.getBlocks = function() {
  var blocks = getDataExtractor().extractBlocks();
  return viewDataAdapter.adaptBlocks(config, blocks);
};

exports.asyncGetPreviewCategories = function() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(exports.getPreviewCategories());
    });
  });
};

exports.asyncGetCategory = function(categoryId) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(exports.getCategory(categoryId));
    });
  });
};

exports.asyncGetSession = function(sessionId) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(exports.getSession(sessionId));
    });
  });
};

exports.asyncGetBlocks = function() {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(exports.getBlocks());
    });
  });
};

function getDataExtractor() {
  var conferenceData = getConferenceData();
  dataExtractor = dataExtractor || new DataExtractor(conferenceData);
  return dataExtractor;
}

function getConferenceData() {
  conferenceData = conferenceData || dataLoader.load();
  return conferenceData;
}
