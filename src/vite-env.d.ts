/// <reference types="vite/client" />
/** Injected by ViteJS define plugin */
declare const APP_VERSION: string;

/** Allow importing JSON files */
declare module "*.json" {
  const value: unknown;
  export default value;
}
