import { Composite, ScrollView, Tab } from "tabris";
import { getById } from "tabris-decorators";
import * as moment from "moment-timezone";
import Link from "../components/Link";
import fontToString from "../helpers/fontToString";
import appConfig from "../configs/config";
import getImage from "../helpers/getImage";
import sizes from "../resources/sizes";
import texts from "../resources/texts";

export default class Conference extends Tab {

  public jsxProperties: JSX.TabProperties;

  @getById private container: ScrollView;
  @getById private linksContainer: Composite;

  private readonly config: any = appConfig.CONFERENCE_PAGE;
  private readonly SPACER_HEIGHT: number = 16;

  constructor() {
    super({
      id: "conference",
      title: texts.CONFERENCE_PAGE_TITLE,
      image: getImage.forDevicePlatform("conference"),
      selectedImage: getImage.forDevicePlatform("conference_selected")
    });
    this.createUI();
  }

  private createUI() {
    this.append(
      <scrollView
        id="container"
        left={0} top={0} right={0} bottom={0}>
        <imageView
          centerX={0} top={0}
          id="logo"
          image={getImage.common("conference_logo")} />
        <textView
          id="date"
          alignment="center"
          font={fontToString({ weight: "bold", size: sizes.FONT_XLARGE })}
          left={sizes.MARGIN} right={sizes.MARGIN} top={["prev()", sizes.MARGIN]}
          text={[this.day(this.config.START_DAY), this.day(this.config.END_DAY)].join(" - ")} />
        <textView
          id="location"
          alignment="center"
          font={fontToString({ weight: "bold", size: sizes.FONT_XLARGE })}
          left={sizes.MARGIN} right={sizes.MARGIN} top="prev()"
          text={this.config.LOCATION} />
        <composite
          id="linksContainer"
          left={0} top={["prev()", sizes.MARGIN_LARGE]} right={0} />
        <textView
          id="conferenceInfo"
          left={sizes.MARGIN_XLARGE} right={sizes.MARGIN_XLARGE} top={["prev()", sizes.MARGIN_XLARGE]}
          markupEnabled={true}
          font={fontToString({ size: sizes.FONT_MEDIUM, family: "sans-serif" })}
          text={this.config.CONFERENCE_INFO || ""} />
      </scrollView>
    );
    this.createSocialLinks(["facebook", "twitter", "googleplus", "xing", "website"]);
    if (this.config.CONFERENCE_INFO) {
      this.container.append(
        <composite
          left={0} top="prev()" right={0} height={this.SPACER_HEIGHT} />
      );
    }
  }

  private createSocialLinks(socialServices: string[]) {
    socialServices.forEach(service => {
      let title = this.config[`${service.toUpperCase()}_TITLE`];
      let url = this.config[`${service.toUpperCase()}_URL`];
      if (title && url) {
        this.createSocialLink({ service, title, url, tag: this.config[`${service.toUpperCase()}_TAG`] })
          .appendTo(this.linksContainer);
      }
    });
  }

  private createSocialLink({ service, title, url, tag }: any) {
    let container = (
      <composite
        width={272} top={["prev()", sizes.MARGIN_LARGE]} centerX={0}>
        <imageView
          left={0} width={24} height={24} centerY={0}
          image={getImage.common(service)} />
        <Link
          font={fontToString({ size: sizes.FONT_XLARGE })}
          left={["prev()", sizes.MARGIN]} centerY={0}
          url={url} text={title} />
      </composite>
    );
    if (tag) {
      container.append(
        <textView
          font={fontToString({ size: sizes.FONT_XLARGE })}
          left={["prev()", sizes.MARGIN]} centerY={0}
          text={"(" + tag + ")"} />
      );
    }
    return container;
  }

  private day(day: string) {
    return moment.tz(day, "DD.MM.YYYY", appConfig.CONFERENCE_TIMEZONE).format("ll");
  }

}
