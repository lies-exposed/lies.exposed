export interface InfiniteListBaseProps {
  width: number;
  height: number;
  items: any[];
  getItem: (data: any[], index: number) => any;
}
