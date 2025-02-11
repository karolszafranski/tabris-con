import conferenceConfiguration from "./eclipseCon2016Config";

let vendorConfiguration = {
  VENDOR: "EclipseSource",
  VENDOR_WEBSITE: "http://eclipsesource.com/",
  PROJECT_URL: "https://github.com/eclipsesource/tabris-con"
};

export default Object.freeze(
  Object.assign({}, vendorConfiguration, conferenceConfiguration)
);
