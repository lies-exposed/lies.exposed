// import * as React from "react"

// export const htmlTabletToBaseWebTablet = (
//   children: any[]
// ): { columns: string[]; data: any[][] } => {
//   if (children !== null && children !== undefined) {
//     const columns = React.Children.toArray(children);

//     const thead = columns.find((thead: any) => thead.type === "thead");
//     const tr = thead.props.children.find((tr: any) => tr.type === "tr");
      
//       .props.children.map((th: any) => {
//         return th.props.children
//       })

//     const data = children
//       .find(c => c.type === "tbody")
//       .props.children.map(tr => {
//         return tr.props.children.map(th => {
//           return th.props.children[0]
//         })
//       })

//     return {
//       columns,
//       data,
//     }
//   }
//   return {
//     columns: [],
//     data: [],
//   }
// }
