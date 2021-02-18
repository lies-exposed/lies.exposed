import * as React from "react";
import { generateRandomColor } from "../../utils/colors";
import { BubbleGraph } from "../Common/Graph/BubbleGraph";

function getRandomArbitrary(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

const data = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Nineth",
  "Tenth",
].map((l) => ({
  label: `${l} Topic`,
  count: getRandomArbitrary(0, 10),
  color: generateRandomColor(),
}));

const BubbleGraphExample: React.FC = () => {
  return <BubbleGraph data={data} width={600} height={300} />;
};
export default BubbleGraphExample;
