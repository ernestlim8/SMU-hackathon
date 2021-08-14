import * as React from "react";
import DifferenceRenderer from "./DifferenceRenderer";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export interface HeroListItem {
  icon: string;
  primaryText: string;
  oldURL: string;
  sections: {};
}

export interface HeroListProps {
  message: string;
  items: HeroListItem[];
}

export interface HeroListState {
  show: boolean[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    heading: {
      fontSize: theme.typography.pxToRem(16),
      fontWeight: theme.typography.fontWeightRegular,
      color: "#575757",
    },
    summaryBox: {
      backgroundColor: "#A4EBF3",
      boxShadow: "none",
    },
  })
);

const HeroList = (props) => {
  const classes = useStyles();

  const { children, items, message } = props;

  const listItems = items.map((item, index) => (
    <Accordion className={classes.summaryBox} id={index}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography className={classes.heading}>{item.primaryText}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <DifferenceRenderer newText={item.newText} oldURL={item.oldURL} sections={item.sections} />
      </AccordionDetails>
    </Accordion>
  ));

  return (
    <main className="ms-welcome__main">
      <h2 className="ms-font-xl ms-fontWeight-semilight ms-fontColor-neutralPrimary ms-u-slideUpIn20">{message}</h2>
      <div className={classes.root}>
        {listItems}
        {children}
      </div>
    </main>
  );
};

export default HeroList;
