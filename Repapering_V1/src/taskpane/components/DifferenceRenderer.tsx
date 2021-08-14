import * as React from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export interface DifferencesProps {
  newText: string;
  oldAct: {};
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
    changesBox: {
        backgroundColor: "#E6FFEC"
    },
    oldTextBox: {
        backgroundColor: "#FFEEF0"
    },
    changesBoxText: {
        color: "green"
    },
    oldBoxText: {
        color: "red"
    }
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
        <Typography className={classes.heading}>{`Section ${key}`}</Typography>
      </AccordionSummary>
      { key in props.oldAct &&
        props.oldAct[key].map((key, index) => (
            <AccordionDetails className={classes.infoBox}>
                <Typography className={classes.oldBoxText} id={index}>
                    {key}
                </Typography>
            </AccordionDetails>
        ))}   
      {props.sections[key].map((key, index) => (
            <AccordionDetails className={classes.infoBox}>
                <Typography className={classes.changesBoxText} id={index}>
                    {key}
                </Typography>
            </AccordionDetails>
      ))}
    </Accordion>
  ));

  return <div className={classes.root}>{getAmends}</div>;
};

export default DifferenceRenderer;
