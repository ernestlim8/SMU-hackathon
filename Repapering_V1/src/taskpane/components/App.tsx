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

  findURL = async (act: string) => {
    console.log(act)
    axios.get("http://localhost:3001/getURL", {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      params: {
        act: act
      }
    })
      .then(res => {
        console.log(res.data)
      })
  }

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
      // need to loop here
      await this.findURL("196A");
      await context.sync();
    });
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
        </HeroList>
      </div>
    );
  }
}
