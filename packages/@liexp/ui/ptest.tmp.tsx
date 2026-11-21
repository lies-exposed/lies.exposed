import { useTransition, type SpringValues } from "@react-spring/web";
interface Arc { startAngle: number; endAngle: number; data: string }
interface Styles { startAngle: number; endAngle: number; opacity: number; [index: string]: unknown }
const arcs: Arc[] = [];
const leaveFn = ({ endAngle }: Arc): Styles => ({ startAngle: 0, endAngle: 0, opacity: 0 });
const updFn = ({ startAngle, endAngle }: Arc): Styles => ({ startAngle, endAngle, opacity: 1 });
export const T = () => {
  const transitions = useTransition<Arc, Styles>(arcs, { from: leaveFn, enter: updFn, update: updFn, leave: leaveFn });
  return transitions((values, item) => <g>{item.data}{String(values.opacity)}</g>);
};
