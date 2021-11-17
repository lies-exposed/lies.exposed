import { cellPlugins } from "@econnessione/ui/components/Common/Editor";
import { RaReactPageInput } from "@react-page/react-admin";
import * as React from "react";
import { InputProps } from "react-admin";

// const MarkdownInput: React.FC<InputProps> = (props) => {
//   const [mode, setMode] = React.useState("html");
//   const [lastValidFormattedValue, setLastValidFormattedValue] =
//     React.useState("");
//   const [lastValidParsedValue, setLastValidParsedValue] = React.useState("");

//   return (
//     <>
//       <div style={{ width: "100%" }}>
//         <ToggleButtonGroup
//           value={mode}
//           exclusive
//           onChange={(e, v) => {
//             setMode(v.replace(mode));
//           }}
//         >
//           <ToggleButton value="mdx">MDX</ToggleButton>
//           <ToggleButton value="html">HTML</ToggleButton>
//         </ToggleButtonGroup>
//       </div>
//       <>
//         {mode === "html" ? (
//           <RichTextInput
//             options={{
//               modules: {
//                 toolbar: toolbarOptions,
//               },
//             }}
//             format={(v: string | undefined) => {
//               if (v) {
//                 return pipe(
//                   mdx.MDXToHTML(v),
//                   IOE.fold(
//                     (e) => () => {
//                       console.error(e);
//                       return lastValidFormattedValue;
//                     },
//                     (value) => () => {
//                       setLastValidFormattedValue(value);
//                       return value;
//                     }
//                   )
//                 )();
//               }
//               return "";
//             }}
//             parse={(v: string) => {
//               return pipe(
//                 mdx.HTMLToMDX(v),
//                 IOE.fold(
//                   (e) => () => {
//                     // eslint-disable-next-line
//                     console.error("Parsing error", e);
//                     return lastValidParsedValue;
//                   },
//                   (value) => () => {
//                     // console.log('parsed value', value)
//                     setLastValidParsedValue(value);
//                     return value;
//                   }
//                 )
//               )();
//             }}
//             {...props}
//           />
//         ) : (
//           <TextInput
//             value={lastValidFormattedValue}
//             multiline={true}
//             style={{ width: "100%" }}
//             {...props}
//           />
//         )}
//       </>
//     </>
//   );
// };
// export default MarkdownInput;

const MarkdownInput: React.FC<InputProps> = (props) => {
  return (
    <RaReactPageInput
      {...props}
      label="Body"
      cellPlugins={cellPlugins}
      lang="en"
    />
  );
};

export default MarkdownInput;
