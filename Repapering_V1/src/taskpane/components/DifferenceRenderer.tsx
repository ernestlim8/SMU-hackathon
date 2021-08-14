import * as React from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export interface DifferencesProps {
  newText: string;
  oldURL: string;
  sections: {};
}

export interface DifferencesState {
  show: boolean[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    heading: {
      fontSize: theme.typography.pxToRem(14),
      color: "white",
      fontWeight: theme.typography.fontWeightRegular,
    },
    summaryBox: {
      backgroundColor: "#96BAFF",
      boxShadow: "none",
    },
    infoBox: {
      backgroundColor: "#f2fdff",
    },
    infoText: {
      color: "#132C33",
      fontSize: theme.typography.pxToRem(14),
    },
  })
);

const DifferenceRenderer = (props) => {
  const classes = useStyles();
  const getAmends = Object.keys(props.sections).map((key, index) => (
    <Accordion className={classes.summaryBox}>
      <AccordionSummary
        className={index.toString()}
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography className={classes.heading}>{key}</Typography>
      </AccordionSummary>
      {props.sections[key].map((key, index) => (
        <AccordionDetails className={classes.infoBox}>
          <Typography className={classes.infoText} id={index}>
            {key}
          </Typography>
        </AccordionDetails>
      ))}
    </Accordion>
  ));

  return <div className={classes.root}>{getAmends}</div>;
};

export default DifferenceRenderer;
