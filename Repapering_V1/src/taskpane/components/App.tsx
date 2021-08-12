import * as React from "react";
import axios from "axios";
import { DefaultButton } from "@fluentui/react";
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
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      listItems: [],
    };
  }

  componentDidMount() {
    this.setState({
      listItems: [],
    });
  }

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

  click = async () => {
    return Word.run(async (context) => {
      let result = context.document.body.search("[(]*[)]", { matchWildcards: true });
      // Queue a command to load the search results and get the font property values.
      context.load(result, "text, font/size");
      result.load("text, font/size");

      await context.sync();
      let newItems: HeroListItem[] = [];
      for (let i = 0; i < result.items.length; i++) {
        const text = result.items[i].text;
        result.items[i].font.highlightColor = "#FFFF00";
        newItems = [...newItems, { icon: "", primaryText: text.substring(1, text.length - 1) }];
      }

      this.setState({ listItems: newItems });
      await context.sync();
    });
  };

  link = async () => {
    console.log("Called add links");
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

      // unique list of all occcurrences of unique act names and abbreviations
      // Assumption: The full act name is referenced before the abbreviation is used

      // object to store mapping between abbreviation and URL

      // change ActList to acts to use API call
      for (let actName of ActList) {
        const sectionNumberRegex = "[0-9]{1,}[A-Z]{0,}";
        const nonBreakingSpace = String.fromCharCode(160);
        const allSearchQueries = [
          `${actName}`,
          `(Section ${sectionNumberRegex} of the )${actName}`,
          `(Section ${sectionNumberRegex} )${actName}`,
          `(s${nonBreakingSpace}${sectionNumberRegex} of the )${actName}`,
          `(s${nonBreakingSpace}${sectionNumberRegex} )${actName}`,
          // Abbreviation Regex,
          `${Abbreviations[actName]}${sectionNumberRegex}{0,}`,
        ];
        let allSearchResults = [];
        for (let searchQuery in allSearchQueries) {
          let searchResult = body.search(searchQuery, { matchWildcards: true, matchWholeWord: true });
          searchResult.load("length, text");
          allSearchResults.push(searchResult);
        }
        // Minimise number of calls of context.sync()
        await context.sync();
        let allInstances: Word.Range[];
        allSearchResults.forEach((searchResult) => {
          allInstances.concat(searchResult.items);
        });
        console.log(allInstances);

        // // Match whole world to make sure that abbreviations which are substrings in other abbreviations don't get caught.
        // // For example: Accountants Act: AA and Accounting and Corporate Regulatory Authority Act: ACRAA
        // let searchResult = body.search(actRegex, { matchWildcards: true, matchWholeWord: true });
        // searchResult.load("length, text");
        // // search for all occurrences of the abbreviation of the actname
        // // Abbreviations should be searched immediately after the search for act name to reduce usage of another context.sync()
        // let abbreviationSearchResult = body.search(abbreviationRegex, { matchWildcards: true, matchWholeWord: true });
        // abbreviationSearchResult.load("length, text");
        // await context.sync();

        // // All search results of both the actname and its abbreviations
        // let searchResultItems = searchResult.items.concat(abbreviationSearchResult.items);

        // Skip expensive operations below if no instances of actName is found.
        if (allInstances.length > 0) {
          // let result = {url: URLList[actName], changed: false};
          let result = await this.findURL(actName, dateString);
          for (let act of allInstances) {
            let url = result.url;
            // Enter branch if contains section number.
            if (act.text.length > actName.length) {
              const section = act.text.split(" ").pop();
              // Example url: https://sso.agc.gov.sg/Act/AA2004#pr12A-
              //
              // It is okay if the section number is invalid. In this case
              // the url (although unnecessarily longer) will still
              // go to the page of the act.
              url = `${url}#pr${section}-`;
            }
            this.formatURL(act, url, result.changed);
          }
        }
        await context.sync();
      }
    });
  };

  formatURL = (act, url, changed) => {
    act.set({
      hyperlink: url,
      font: {
        color: "Black",
      },
    });
    if (changed) {
      act.font.highlightColor = "#FFFF00";
    }
  };

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/logo-filled.png" message="Please sideload your addin to see app body." />
      );
    }

    return (
      <div className="ms-welcome">
        <Header logo="assets/logo-filled.png" title={this.props.title} message="Welcome" />
        <HeroList message="Discover what Office Add-ins can do for you today!" items={this.state.listItems}>
          <p className="ms-font-l">
            Modify the source files, then click <b>Run</b>.
          </p>
          <DefaultButton className="ms-welcome__action" iconProps={{ iconName: "ChevronRight" }} onClick={this.click}>
            Run
          </DefaultButton>
          <DefaultButton className="ms-welcome__action" iconProps={{ iconName: "ChevronRight" }} onClick={this.link}>
            Add Links
          </DefaultButton>
        </HeroList>
      </div>
    );
  }
}
