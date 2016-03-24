var sizes = require("../../resources/sizes");
var fontToString = require("../../helpers/fontToString");
var colors = require("../../resources/colors");
var getImage = require("../../helpers/getImage");
var viewDataProvider = require("../../viewDataProvider");
var SessionPage = require("../../pages/SessionPage");
var SessionsPage = require("../../pages/SessionsPage");
var TimezonedDate = require("../../TimezonedDate");
var Circle = require("../../components/Circle");
var applyPlatformStyle = require("../../helpers/applyPlatformStyle");
var addProgressTo = require("../../helpers/addProgressTo");

module.exports = {
  itemHeight: sizes.SCHEDULE_PAGE_ITEM_HEIGHT,
  initializeCell: function(cell) {
    var backgroundShade = new tabris.Composite({
      visible: false, background: colors.ACTION_COLOR,
      left: 0, top: 0, right: 0, bottom: 0
    }).appendTo(cell);

    var circle = Circle.create({
      left: sizes.MARGIN, centerY: 0, radius: sizes.BLOCK_CIRCLE_RADIUS,
      color: colors.BACKGROUND_COLOR
    }).appendTo(cell);

    var textContainer = new tabris.Composite({
      left: sizes.LEFT_CONTENT_MARGIN, top: 0, right: sizes.MARGIN_LARGE
    }).appendTo(cell);

    var feedbackIndicator = new tabris.ImageView({
      class: "feedbackIndicator",
      width: 24, height: 24,
      right: sizes.MARGIN_LARGE,
      progress: false
    }).appendTo(cell);
    addProgressTo(feedbackIndicator);
    applyPlatformStyle(feedbackIndicator);

    var startTimeTextView = new tabris.TextView({
      textColor: colors.DARK_SECONDARY_TEXT_COLOR,
      font: fontToString({weight: "bold", size: sizes.FONT_XLARGE}),
      left: 0, top: sizes.MARGIN_LARGE, right: 0
    }).appendTo(textContainer);

    var titleTextView = new tabris.TextView({
      textColor: colors.ACCENTED_TEXT_COLOR,
      maxLines: 2,
      font: fontToString({weight: "bold", size: sizes.FONT_MEDIUM}),
      left: 0, top: ["prev()", sizes.MARGIN_LARGE], right: 0
    }).appendTo(textContainer);

    var summaryTextView = new tabris.TextView({
      left: 0, top: ["prev()", sizes.MARGIN], right: 0,
      textColor: colors.DARK_SECONDARY_TEXT_COLOR,
      maxLines: 1,
      font: fontToString({size: sizes.FONT_MEDIUM})
    }).appendTo(textContainer);

    var imageView = new tabris.ImageView({
      left: 0, right: textContainer, centerY: 0
    }).appendTo(cell);

    cell.on("change:item", function(widget, item) {
      circle.set("visible", !!item.sessionId);
      startTimeTextView.set("text", item.startTime);
      titleTextView.set("text", item.title);
      summaryTextView.set("text", item.sessionType !== "free" ? item.summary : "");
      imageView.set("image", getImage.forDevicePlatform(item.image));
      if (item.feedbackIndicatorState && item.feedbackIndicatorState !== "loading") {
        feedbackIndicator.set("image", getImage.forDevicePlatform("schedule_feedback_" + item.feedbackIndicatorState));
      } else {
        feedbackIndicator.set("image", null);
      }
      feedbackIndicator.set("progress", item.feedbackIndicatorState === "loading");

      if (item.shouldPop) {
        setTimeout(function() {
          backgroundShade
            .once("animationend", function() {this.set("visible", false);})
            .set({visible: true, opacity: 1})
            .animate({opacity: 0}, {duration: 1000, easing: "ease-out"});
        }, 800);
        item.shouldPop = false;
      } else {
        backgroundShade.set("visible", false);
      }
    });
  },
  select: function(widget, item) {
    if (item.sessionId) {
      var sessionPage = SessionPage.create().open();
      viewDataProvider.getSession(item.sessionId)
        .then(function(session) {
          sessionPage.set("data", session);
        });
      tabris.ui.find("#schedule").set("lastSelectedSessionId", item.sessionId);
    } else if (item.sessionType === "free") {
      var page = SessionsPage.create().open();
      var date1 = new TimezonedDate(item.startTimestamp);
      var date2 = new TimezonedDate(item.endTimestamp);
      viewDataProvider.getSessionsInTimeframe(date1.toJSON(), date2.toJSON())
        .then(function(sessions) {
          var from = date1.format("LT");
          var to = date2.format("LT");
          page.set("data", {title: from + " - " + to, items: sessions});
        });
    }
  }
};
