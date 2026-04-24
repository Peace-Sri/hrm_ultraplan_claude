import { createI18n } from 'vue-i18n'
import baseTh from './base/th.json'
import baseEn from './base/en.json'

type MessageShape = Record<string, unknown>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const i18n = createI18n<any, 'th' | 'en'>({
  legacy: false,
  locale: 'th',
  fallbackLocale: 'en',
  messages: {
    th: baseTh,
    en: baseEn,
  },
  missingWarn: import.meta.env.DEV,
  fallbackWarn: import.meta.env.DEV,
})

/**
 * Merge per-module messages into the global i18n instance.
 * Call from each module's main entry to keep bundles lean.
 */
export function registerModuleMessages(
  namespace: string,
  th: MessageShape,
  en: MessageShape,
): void {
  i18n.global.mergeLocaleMessage('th', { [namespace]: th })
  i18n.global.mergeLocaleMessage('en', { [namespace]: en })
}
