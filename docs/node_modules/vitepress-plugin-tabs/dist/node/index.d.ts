import MarkdownIt from "markdown-it";

//#region src/node/markdownPlugin.d.ts
declare const tabsPlugin: (md: MarkdownIt) => void;
//#endregion
export { tabsPlugin as tabsMarkdownPlugin };