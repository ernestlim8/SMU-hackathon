import App from "./components/App";
import { AppContainer } from "react-hot-loader";
import { initializeIcons } from "@fluentui/font-icons-mdl2";
import { ThemeProvider } from "@fluentui/react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter as Router, Route } from "react-router-dom";
import LawDetail from "./components/LawDetail";

/* global document, Office, module, require */

initializeIcons();

let isOfficeInitialized = false;

const title = "Contoso Task Pane Add-in";

const render = (Component) => (
  <AppContainer>
    <ThemeProvider>
      <Component title={title} isOfficeInitialized={isOfficeInitialized} />
    </ThemeProvider>
  </AppContainer>
);

/* Render application after Office initializes */
Office.initialize = () => {
  isOfficeInitialized = true;
  ReactDOM.render(
    <Router>
      <Route path="/1">{render(LawDetail)}</Route>
      <Route exact path="">
        {render(App)}
      </Route>
    </Router>,
    document.getElementById("container")
  );
};

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    render(NextApp);
  });
}
