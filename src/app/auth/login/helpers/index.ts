import type { ResponseError } from '@siberiacancode/fetches'

const phoneLength = 11

export function toDigits(value: string, maxLength = phoneLength) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

export function formatPhone(phone: string) {
  const digits = toDigits(phone)

  if (!digits) {
    return ''
  }

  const normalized = digits.startsWith('8')
    ? `7${digits.slice(1)}`
    : digits

  const country = normalized.slice(0, 1)
  const area = normalized.slice(1, 4)
  const first = normalized.slice(4, 7)
  const second = normalized.slice(7, 9)
  const third = normalized.slice(9, 11)

  return [`+${country}`, area, first, second, third].filter(Boolean).join(' ')
}

export function getErrorMessage(error: unknown) {
  const responseError = error as ResponseError | undefined
  const reason = responseError?.response?.data && typeof responseError.response.data === 'object'
    ? Reflect.get(responseError.response.data, 'reason')
    : null

  return typeof reason === 'string' && reason.length > 0
    ? reason
    : 'Не удалось выполнить запрос. Попробуйте ещё раз.'
}
