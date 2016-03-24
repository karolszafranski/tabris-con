var sizes = require("../resources/sizes");
var fontToString = require("../helpers/fontToString");
var Link = require("../components/Link");

exports.create = function() {
  var page = new tabris.Page({topLevel: false});
  var scrollView = new tabris.ScrollView({
    left: 0, top: 0, right: 0, bottom: 0
  }).appendTo(page);
  var container = new tabris.Composite({
    left: sizes.MARGIN_LARGE, top: sizes.MARGIN_LARGE, right: sizes.MARGIN_LARGE
  }).appendTo(scrollView);
  var title = new tabris.TextView({
    left: 0, top: 0, right: 0,
    font: fontToString({size: sizes.FONT_XXLARGE, weight: "bold"}),
    text: "Usage of Icon8 iOS icons"
  }).appendTo(container);
  new tabris.TextView({
    left: 0, top: [title, sizes.MARGIN_LARGE], right: 0,
    // jscs:disable maximumLineLength
    text: "Icon8 icons may only be used for projects derived from the tabris-con open-source template:"
    // jscs:enable maximumLineLength
  }).appendTo(container);
  var tabrisConLink = Link.create({
    alignment: "center",
    text: "https://github.com/eclipsesource/tabris-con",
    url: "https://github.com/eclipsesource/tabris-con",
    left: 0, top: ["prev()", sizes.MARGIN], right: 0
  }).appendTo(container);
  new tabris.TextView({
    left: 0, top: [tabrisConLink, sizes.MARGIN],
    text: "For licensing details, contact "
  }).appendTo(container);
  Link.create({
    text: "Icons8",
    url: "https://icons8.com/",
    left: "prev()", top: [tabrisConLink, sizes.MARGIN]
  }).appendTo(container);
  return page;
};
