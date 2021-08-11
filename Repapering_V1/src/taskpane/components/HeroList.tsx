import * as React from "react";
import { HashRouter as Router, Link, Route } from "react-router-dom";
// import {Link} from "react-router-dom"
import DifferenceRenderer from "./DifferenceRenderer";

export interface HeroListItem {
  icon: string;
  primaryText: string;
}

export interface HeroListProps {
  message: string;
  items: HeroListItem[];
}

export default class HeroList extends React.Component<HeroListProps> {
  render() {
    const { children, items, message } = this.props;
    // console.log(items)
    // const renderLinks = items.map((item, index) => {
    //           console.log(item);
    //           <li className="ms-ListItem" key={index}>
    //             <i className={`ms-Icon ms-Icon--${item.icon}`}></i>
    //               <Link to={`/${item.primaryText}`}>
    //                 {item.primaryText}
    //               </Link>
    //               <Route exact path={`/${item.primaryText}`}
    //                 component={() => {<DifferenceRenderer newText={item.primaryText} oldURL={item.primaryText}/>}}
    //               >
    //               </Route>
                
    //           </li>    
    //         })
    
    const listItems = items.map((item, index) => (
      <Router>
      <li className="ms-ListItem" key={index}>
        <i className={`ms-Icon ms-Icon--${item.icon}`}></i>
        <Link to="/1">
          {item.primaryText}
        </Link>
        <Route exact path='/1'>
          <div style={{alignContent: "left"}}>
          <DifferenceRenderer newText={item.primaryText} oldURL={item.primaryText}/>
          </div>
        </Route>
      </li>
      </Router>
    ));

    return (
      <main className="ms-welcome__main">
        <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">{message}</h2>
        <ul className="ms-List ms-welcome__features ms-u-slideUpIn10">{listItems}</ul>
        {children}
      </main>
    );
  }
}
