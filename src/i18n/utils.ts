// precisian-blog/src/i18n/utils.ts
import { ui, defaultLang, type Lang, type UiKey } from './ui'

const LANG_PATTERN = /^\/blog\/(pt-BR|en)(\/|$)/

export function getLangFromUrl(url: URL): Lang {
  const match = url.pathname.match(LANG_PATTERN)
  if (match && (match[1] === 'pt-BR' || match[1] === 'en')) {
    return match[1]
  }
  return defaultLang
}

export function useTranslations(lang: Lang | string) {
  const resolved: Lang = lang === 'pt-BR' || lang === 'en' ? lang : defaultLang
  return function t(key: UiKey): string {
    return ui[resolved][key] ?? ui[defaultLang][key]
  }
}

export function getLocalizedPath(lang: Lang, path: string): string {
  const cleaned = path.replace(/^\/+/, '')
  return `/${lang}/${cleaned}`
}
