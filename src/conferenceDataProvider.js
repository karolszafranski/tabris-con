/*globals Promise: true*/
var persistedStorage = require("./persistedStorage");
var DataExtractor = require("./DataExtractor");
var fetchNewData = require("./fetchNewData");
var initialData = require("./initialData");
var alert = require("./components/alert");
var conferenceData;

exports.get = function() {
  handleUWP();
  if (conferenceData) {
    return Promise.resolve(conferenceData);
  }
  handleAppUpgrade();
  return fetchNewData()
    .then(function(data) {
      if (data) {
        persistData(data);
      } else {
        handleFallingBackToOldData({fetchFailed: false});
      }
    })
    .catch(function() {
      handleFallingBackToOldData({fetchFailed: true});
    })
    .then(function() {
      conferenceData = getDataFromStorage();
      return conferenceData;
    });
};

exports.invalidateCache = function() {
  conferenceData = null;
};

function handleUWP() {
  if (device.platform === "UWP") {
    if (!conferenceData) {
      var dataExtractor = new DataExtractor(initialData.get());
      conferenceData = {
        sessions: dataExtractor.extractSessions(),
        previewCategories: dataExtractor.extractPreviewCategories(),
        categories: dataExtractor.extractCategories(),
        keynotes: dataExtractor.extractKeynotes(),
        blocks: dataExtractor.extractBlocks()
      };
    }
  }
}

function handleAppUpgrade() {
  var currentVersion = tabris._client.get("tabris.App", "version");
  var appVersion = localStorage.getItem("appVersion");
  if (currentVersion !== appVersion && device.platform !== "UWP") { // TODO: also handle on Windows when client supports app version
    persistedStorage.removeConferenceData();
  }
  localStorage.setItem("appVersion", currentVersion);
}

function handleFallingBackToOldData(options) {
  var dataStored = persistedStorage.conferenceDataStored();
  if (options.fetchFailed || !dataStored) {
    alert.show(dataMayBeOutdatedMessage(), "Warning", "OK");
  }
  if (!dataStored) {
    persistData(initialData.get());
  }
}

function persistData(data) {
  var dataExtractor = new DataExtractor(data);
  persistedStorage.setSessions(dataExtractor.extractSessions());
  persistedStorage.setPreviewCategories(dataExtractor.extractPreviewCategories());
  persistedStorage.setCategories(dataExtractor.extractCategories());
  persistedStorage.setKeynotes(dataExtractor.extractKeynotes());
  persistedStorage.setBlocks(dataExtractor.extractBlocks());
}

function getDataFromStorage() {
  return {
    sessions: persistedStorage.getSessions(),
    previewCategories: persistedStorage.getPreviewCategories(),
    categories: persistedStorage.getCategories(),
    keynotes: persistedStorage.getKeynotes(),
    blocks: persistedStorage.getBlocks()
  };
}

function dataMayBeOutdatedMessage() {
  return "We could not determine whether newer conference data is available. Shown data may be outdated.";
}
