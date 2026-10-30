// unplugin-vue-markdown compiles each .md file into a Vue component
declare module '*.md' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent;
  export default component;
}
