var sizes = require("../resources/sizes");

exports.create = function() {
  var indicator;
  if (device.platform === "iOS") {
    indicator = new tabris.Composite({
      left: sizes.MARGIN_LARGE, top: sizes.MARGIN, bottom: sizes.MARGIN, width: 2
    }).on("change:color", function(widget, color) {widget.set("background", color);});
  } else {
    indicator = new tabris.Composite({
      left: 0,
      right: "#sessionPageTitleTextView",
      top: ["#sessionPageNavigationControls", sizes.MARGIN + 2]
    });
    var square = new tabris.Composite({
      centerX: 0, top: sizes.MARGIN_XXSMALL,
      width: sizes.TRACK_SQUARE_SIZE,
      height: sizes.TRACK_SQUARE_SIZE
    }).appendTo(indicator);
    indicator.on("change:color", function(widget, color) {square.set("background", color);});
  }
  return indicator;
};
