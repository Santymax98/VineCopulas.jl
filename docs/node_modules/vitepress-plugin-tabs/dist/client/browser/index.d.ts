import "./index.css";
import { App } from "vue";

//#region src/client/index.d.ts
declare const enhanceAppWithTabs: (app: App) => void;
//#endregion
export { enhanceAppWithTabs };