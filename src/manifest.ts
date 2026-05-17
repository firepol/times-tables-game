const MANIFEST: Record<string, string> = {
  it: 'manifest-it.webmanifest',
  en: 'manifest-en.webmanifest',
}

export function applyManifestLocale(lang: string) {
  const file = MANIFEST[lang] ?? MANIFEST.en
  const link = document.getElementById('pwa-manifest') as HTMLLinkElement | null
  if (link && !link.href.endsWith(file)) {
    link.href = file
  }
}

export function readStoredLang(): string {
  try {
    const raw = localStorage.getItem('tabelline_settings')
    if (raw) {
      const s = JSON.parse(raw)
      if (s.language) return s.language
    }
  } catch {}
  return localStorage.getItem('i18nextLng') ?? 'en'
}
