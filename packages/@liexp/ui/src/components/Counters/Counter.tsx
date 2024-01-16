import * as React from "react";
import { styled } from "../../theme/index.js";

const PREFIX = "Counter";

const classes = {
  root: `${PREFIX}-root`,
  counter: `${PREFIX}-counter`,
};

const Root = styled("div")(({ theme }) => ({
  [`& .${classes.root}`]: {
    margin: "20px 0",
  },

  [`& .${classes.counter}`]: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize * 3,
    color: theme.palette.common.black,
    fontWeight: theme.typography.fontWeightBold as any,
  },
}));

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
    return () => {
      clearTimeout(countdownTimer);
    };
  });

  return (
    <Root style={{ textAlign: "center" }}>
      <div className={classes.root}>
        <div className={classes.counter}>{count.toLocaleString()}</div>

        <span
          style={{
            verticalAlign: "top",
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
    </Root>
  );
};
