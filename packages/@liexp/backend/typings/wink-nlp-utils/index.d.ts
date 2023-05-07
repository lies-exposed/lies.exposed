declare module "wink-nlp-utils" {
  interface StringUtils {
    removeHTMLTags: (s: string) => string;
    removePunctuations: (s: string) => string;
    removeExtraSpaces: (s: string) => string;
    retainAlphaNums: (s: string) => string;
    sentences: (s: string) => string[];
  }

  var string: StringUtils;

  export = { string };
}
