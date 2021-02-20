import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    counter: {
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize * 2,
      color: theme.palette.common.black,
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

interface CounterProps {
  message?: string;
  sources: Array<{ label: string; url: string }>;
  getCount: () => number | string;
}
export const Counter: React.FC<CounterProps> = (props) => {
  const [count, setCount] = React.useState(props.getCount());

  React.useEffect(() => {
    const countdownTimer = setTimeout(() => {
      setCount(props.getCount());
    }, 1000);
    return () => clearTimeout(countdownTimer);
  });

  const classes = useStyles();

  return (
    <div style={{ textAlign: "center" }}>
      <div className={classes.root}>
        <div className={classes.counter}>{count.toLocaleString()}</div>

        <span
          style={{
            verticalAlign: "top",
            // fontSize: $theme.typography.font550.fontSize,
            // lineHeight: $theme.typography.font550.lineHeight,
          }}
        >
          {props.message !== undefined ? "*" : ""}
        </span>
      </div>
      {props.message !== undefined ? <p>{`* ${props.message}`}</p> : null}
      <p>
        {props.sources.map((s) => (
          <a key={s.label} href={s.url}>
            {s.label}
          </a>
        ))}
      </p>
    </div>
  );
};
