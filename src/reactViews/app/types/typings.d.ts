declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.svg';

declare namespace __WebpackModuleApi {
    const RequireContext: any;
}

declare const __webpack_require__: any;