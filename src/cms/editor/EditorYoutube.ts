import { EditorComponentOptions } from "netlify-cms-core"

export const EditorYoutube: EditorComponentOptions = {
  // Internal id of the component
  id: "youtube",
  // Visible label
  label: "Youtube",
  // Fields the user need to fill out when adding an instance of the component
  fields: [{ name: "id", label: "Youtube Video ID", widget: "string" }],
  // Pattern to identify a block as being an instance of this component
  pattern: /^youtube (\S+)$/,
  // Function to extract data elements from the regexp match
  fromBlock: function(match) {
    return {
      id: match[1],
    }
  },
  // Function to create a text block from an instance of this component
  toBlock: function(obj) {
    return `youtube ${obj.id}`
  },
  // Preview output for this component. Can either be a string or a React component
  // (component gives better render performance)
  toPreview: function(obj) {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${obj.id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
  },
}
