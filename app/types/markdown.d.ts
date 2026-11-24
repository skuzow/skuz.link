// unplugin-vue-markdown compiles each .md file into a Vue component
declare module '*.md' {
  import type { DefineComponent } from 'vue';
  import type { LegalSection } from '~/types/legal';

  const component: DefineComponent;
  export default component;

  // the numbered sections in order, collected by the heading rule in nuxt.config.ts
  export const sections: LegalSection[];
}
