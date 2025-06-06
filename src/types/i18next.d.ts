// src/types/i18next.d.ts
import 'i18next';
import { resources } from '../lib/i18n';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources['en'];
    defaultNS: 'ui';
  }
}
