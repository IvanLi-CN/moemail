const EMAIL_ALIAS_PATTERN = /^[a-z0-9_.+-]+$/i

export function normalizeEmailAlias(value: string) {
  return value.trim().toLowerCase()
}

export function isValidEmailAlias(value: string) {
  return EMAIL_ALIAS_PATTERN.test(value)
}

export function buildDisposableEmailAddress(alias: string, domain: string) {
  return `${normalizeEmailAlias(alias)}@${domain}`
}
