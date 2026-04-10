import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import {
  formatPhone,
  getErrorMessage,
  toDigits,
} from '@/app/auth/login/helpers'
import {
  usePostApiAuthOtpMutation,
  usePostApiUsersSigninMutation,
} from '@/shared/api/generated'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useSession } from '@/shared/providers/session/session-provider'

const defaultResendTimeoutSeconds = 60

const phoneSchema = z.object({
  phone: z.string().min(1, 'Поле является обязательным'),
  code: z.string(),
})

const codeSchema = z.object({
  phone: z.string().min(1, 'Поле является обязательным'),
  code: z.string().length(6, 'Код должен содержать 6 цифр'),
})

type LoginFormData = z.infer<typeof codeSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useSession()
  const [otpSent, setOtpSent] = useState(false)
  const [timer, setTimer] = useState(0)

  const {
    clearErrors,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(otpSent ? codeSchema : phoneSchema),
    defaultValues: {
      phone: '',
      code: '',
    },
  })

  const phoneValue = watch('phone')

  const {
    mutateAsync: sendOtp,
    isPending: isSendingOtp,
  } = usePostApiAuthOtpMutation()

  const {
    mutateAsync: signIn,
    isPending: isSigningIn,
  } = usePostApiUsersSigninMutation()

  useEffect(() => {
    if (timer <= 0) {
      return
    }

    const intervalId = window.setInterval(() => {
      setTimer(current => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [timer])

  async function requestOtp(phone: string) {
    clearErrors()

    try {
      const response = await sendOtp({
        body: { phone },
      })

      if (response.data.success) {
        setOtpSent(true)
        setValue('code', '')
        setTimer(Math.ceil((response.data.retryDelay || defaultResendTimeoutSeconds * 1000) / 1000))
        return
      }

      setError('phone', {
        type: 'server',
        message: response.data.reason || 'Не удалось отправить код.',
      })
    }
    catch (error) {
      setError('phone', {
        type: 'server',
        message: getErrorMessage(error),
      })
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!otpSent) {
      await requestOtp(values.phone)
      return
    }

    clearErrors('code')

    try {
      const response = await signIn({
        body: {
          code: Number(values.code),
          phone: values.phone,
        },
      })

      if (response.data.success) {
        login(response.data.token, response.data.user)
        void navigate('/')
      }
    }
    catch (error) {
      setError('code', {
        type: 'server',
        message: getErrorMessage(error),
      })
    }
  })

  return (
    <main className="min-h-screen bg-white px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <section className="w-full max-w-[420px]">
          <h1 className="text-heading-2 text-foreground">
            Вход
          </h1>
          <p className="mt-4 max-w-[320px] text-paragraph-14 text-muted-foreground">
            {otpSent
              ? 'Введите проверочный код для входа в личный кабинет'
              : 'Введите номер телефона для входа в личный кабинет'}
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              {otpSent
                ? (
                    <Input
                      className="h-11 rounded-md border-[#d7dbe4] bg-white"
                      disabled
                      readOnly
                      value={formatPhone(phoneValue)}
                    />
                  )
                : (
                    <Input
                      {...register('phone')}
                      autoComplete="tel"
                      className="h-11 rounded-md border-[#d7dbe4] bg-white"
                      inputMode="numeric"
                      onInput={(event) => {
                        event.currentTarget.value = toDigits(event.currentTarget.value)
                      }}
                      placeholder="Телефон"
                    />
                  )}
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {otpSent && (
              <div className="space-y-2">
                <Input
                  {...register('code')}
                  autoComplete="one-time-code"
                  className="h-11 rounded-md border-[#d7dbe4] bg-white"
                  inputMode="numeric"
                  onInput={(event) => {
                    event.currentTarget.value = toDigits(event.currentTarget.value, 6)
                  }}
                  placeholder="Проверочный код"
                />
                {errors.code && (
                  <p className="text-sm text-destructive">
                    {errors.code.message}
                  </p>
                )}
              </div>
            )}

            <Button
              className="mt-6 h-12 w-full max-w-[260px] text-[15px] font-semibold"
              disabled={isSendingOtp || isSigningIn}
              type="submit"
            >
              {otpSent ? 'Войти' : 'Продолжить'}
            </Button>

            {otpSent && (
              <div className="pt-4 text-paragraph-14 text-muted-foreground">
                {timer > 0
                  ? (
                      <span>
                        Запросить код повторно можно через
                        {' '}
                        {timer}
                        {' '}
                        секунд
                      </span>
                    )
                  : (
                      <button
                        className="cursor-pointer font-medium text-foreground"
                        onClick={() => {
                          void requestOtp(getValues('phone'))
                        }}
                        type="button"
                      >
                        Запросить код ещё раз
                      </button>
                    )}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}
