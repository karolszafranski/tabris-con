var sizes = require("../resources/sizes");
var fontToString = require("../helpers/fontToString");
var _ = require("lodash");

exports.create = function(configuration) {
  var title = new tabris.Composite(_.extend({
    left: 0, top: 0, right: 0, height: sizes.SESSION_CATEGORY_TITLE_CELL_HEIGHT
  }, configuration));
  var titleTextView = new tabris.TextView({
    class: "titleTextView",
    left: sizes.MARGIN_LARGE, centerY: 0, right: ["#moreTextView", sizes.MARGIN],
    maxLines: 1,
    font: fontToString({weight: "bold", size: sizes.FONT_XLARGE}),
    textColor: configuration ? configuration.textColor || "initial" : "initial"
  }).appendTo(title);
  title.on("change:text", function(widget, text) {
    titleTextView.set("text", text);
  });
  return title;
};
