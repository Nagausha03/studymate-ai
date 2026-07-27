declare module '*.jpg';
declare module '*.png';
declare module '*.svg';
declare module '*?url' {
  const url: string;
  export default url;
}
