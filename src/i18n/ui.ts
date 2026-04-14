// precisian-blog/src/i18n/ui.ts
export const languages = {
  'pt-BR': 'Português',
  en: 'English',
} as const

export type Lang = keyof typeof languages

export const defaultLang: Lang = 'pt-BR'

export const ui = {
  'pt-BR': {
    'nav.home': 'Início',
    'nav.tags': 'Tags',
    'nav.about': 'Sobre',
    'post.publishedOn': 'Publicado em',
    'post.readingTime': 'min de leitura',
    'post.tags': 'Tags',
    'post.translation.available': 'Disponível em',
    'post.translation.unavailable': 'Tradução indisponível',
    'tableOfContents.title': 'Nesta página',
    'site.tagline': 'Blog técnico da Precisian — AI-powered data integrity',
    'site.footer.copyright': 'Precisian é uma plataforma da Nação Digital',
  },
  en: {
    'nav.home': 'Home',
    'nav.tags': 'Tags',
    'nav.about': 'About',
    'post.publishedOn': 'Published on',
    'post.readingTime': 'min read',
    'post.tags': 'Tags',
    'post.translation.available': 'Available in',
    'post.translation.unavailable': 'Translation unavailable',
    'tableOfContents.title': 'On this page',
    'site.tagline': 'Precisian technical blog — AI-powered data integrity',
    'site.footer.copyright': 'Precisian is a Nação Digital platform',
  },
} as const

export type UiKey = keyof (typeof ui)['pt-BR']
