import * as React from "react";
import axios from "axios";
import { DefaultButton } from "@fluentui/react";
import { CircularProgress, Grid } from "@material-ui/core";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";

import { ActList } from "../../Data/ActNames";
import { Abbreviations } from "../../Data/Abbreviations";
// import { URLList } from "../../Data/ActURLs";

/* global Word */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  listItems: HeroListItem[];
  shouldShowLinks: boolean;
  isLoading: boolean;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: [],
      shouldShowLinks: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.setState({
      listItems: [],
      shouldShowLinks: false,
    });
  }

  TAG_NAME = "link";
  HIGHLIGHT_COLOR = "#FFFF91";
  sectionNumberRegex = "([0-9]{1,}[A-Z]{0,})";
  nonBreakingSpace = String.fromCharCode(160);
  allSearchQueries = (actName) => {
    return [
      `${actName}`,
      // Abbreviation Regex,
      `${Abbreviations[actName]}${this.sectionNumberRegex}{0,}`,
      // `Section ${this.sectionNumberRegex} of the ${actName}`,
      // `Section ${this.sectionNumberRegex} ${actName}`,
      // `s${this.nonBreakingSpace}${this.sectionNumberRegex} of the ${actName}`,
      // `s${this.nonBreakingSpace}${this.sectionNumberRegex} ${actName}`,
    ];
  };

  findURL = async (act: string, date: string) => {
    const promise = axios.get("http://localhost:3001/getURL", {
      params: {
        act: act,
        date: date,
      },
    });
    const data = promise.then((res) => res.data);
    return data;
  };

  hyperlinkActs = (actName: string, dateString: string, allInstances: Word.Range[]) => {
    console.log(`fetching url for ${actName}...`);
    let result = await this.findURL(actName, dateString);
    for (let actInstance of allInstances) {
      let url = result.url;
      // Enter branch if contains section number.
      if (actInstance.text.length > actName.length) {
        const section = actInstance.text.split(" ").pop();
        // Example url: https://sso.agc.gov.sg/Act/AA2004#pr12A-
        //
        // It is okay if the section number is invalid. In this case the url (although unnecessarily longer)
        //  will still go to the page of the act.
        url = `${url}#pr${section}-`;
      }
      this.formatURL(actInstance, url, result.changed);
    }
  };

  searchForAct = (body, actName) => {
    const allSearchResults: Word.RangeCollection[] = [];
    for (let searchQuery of this.allSearchQueries(actName)) {
      let searchResult = body.search(searchQuery, { matchWildcards: true, matchWholeWord: true });
      searchResult.load("length, text");
      allSearchResults.push(searchResult);
    }
    return allSearchResults;
  };

  link = async () => {
    console.log("Called add links");
    this.setState({ shouldShowLinks: true, isLoading: true });
    return Word.run(async (context) => {
      var body = context.document.body;
      // Make request to backend for all the URLS
      // const findURLs = async () => {
      //       const promise = axios.get("http://localhost:3001/getAllActNames");
      //       const data = promise.then((res) => res.data);
      //       return data;
      //   };
      // let arr = await findURLs();
      // let acts = arr.acts

      let date = `([0-9]{1,2} [a-zA-Z]* [0-9]{4})`;

      let dateSearch = body.search(date, { matchWildcards: true });
      dateSearch.load("length, text");

      await context.sync();
      let dateString = new Date(2021, 1, 1).toDateString();
      if (dateSearch.items.length > 0) {
        dateString = dateSearch.items[0].text;
      }

      let searchResultsMap: Map<string, Word.RangeCollection[]> = new Map();
      console.log("searching for acts...");
      for (let actName of ActList) {
        searchResultsMap.set(actName, this.searchForAct(body, actName));
      }
      await context.sync();
      console.log("search complete");
      console.log("formatting acts...");
      const promise = new Promise<void>((resolve) => {
        var counter = 0;
        searchResultsMap.forEach(async (searchResults: Word.RangeCollection[], actName) => {
          for (let searchResult of searchResults) {
            const allInstances = searchResult.items;
            if (allInstances.length > 0) {
              this.hyperlinkActs(actName, dateString, allInstances);
            }
          }
          counter += 1;
          if (counter >= 538) {
            resolve();
          }
        });
      });
      promise.then(() => {
        // await context.sync();
        this.setState({ isLoading: false });
        console.log("add links complete");
      });
    });
  };

  formatURL = (act: Word.Range, url: string, changed: boolean) => {
    console.log(`formatting ${act.text}`);
    act.set({
      hyperlink: url,
      font: {
        color: "Black",
      },
    });
    // Insert Content Control to set up for hide/show links.
    var contentControl = act.insertContentControl();
    contentControl.tag = this.TAG_NAME;
    if (changed) {
      act.font.highlightColor = this.HIGHLIGHT_COLOR;
      contentControl.color = this.HIGHLIGHT_COLOR;
    }
  };

  updateLinksAppearance = async () => {
    console.log(this.state.shouldShowLinks ? "called hideLinks" : "called showLinks");
    return Word.run(async (context) => {
      const allLinks = context.document.contentControls.getByTag(this.TAG_NAME);
      allLinks.load("text, color");
      await context.sync();
      for (let link of allLinks.items) {
        const text = link.getRange();
        if (this.state.shouldShowLinks) {
          const highlightColor = link.color === "#000000" ? null : link.color;
          text.set({
            font: {
              underline: "Single",
              highlightColor: highlightColor,
            },
          });
        } else {
          text.set({
            font: {
              underline: "None",
              highlightColor: null,
            },
          });
        }
      }
    });
  };

  handleToggleLinksVisibility = () => {
    const oldState = this.state.shouldShowLinks;
    this.setState({ shouldShowLinks: !oldState });
    this.updateLinksAppearance();
  };

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/logo-filled.png" message="Please sideload your addin to see app body." />
      );
    }

    const renderShowLinksCheckbox = () => {
      return (
        <label>
          <input
            name="isGoing"
            type="checkbox"
            checked={this.state.shouldShowLinks}
            onChange={this.handleToggleLinksVisibility}
          />
          Show links
        </label>
      );
    };

    return (
      <div className="ms-welcome">
        <Header logo="assets/logo-filled.png" title={this.props.title} message="Welcome" />
        <HeroList message="Discover what Office Add-ins can do for you today!" items={this.state.listItems}>
          <p className="ms-font-l">
            Modify the source files, then click <b>Run</b>.
          </p>
          {this.state.isLoading ? (
            <CircularProgress color="secondary" />
          ) : (
            <Grid container direction="column">
              <Grid item xs={6}>
                <DefaultButton
                  className="ms-welcome__action"
                  iconProps={{ iconName: "ChevronRight" }}
                  onClick={this.link}
                >
                  Add Links
                </DefaultButton>
              </Grid>
              {renderShowLinksCheckbox()}
            </Grid>
          )}
        </HeroList>
      </div>
    );
  }
}
