import { Button } from '@/shared/components/ui/button'
import { useSession } from '@/shared/providers/session/session-provider'

export function HomePage() {
  const { logout, user } = useSession()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%),linear-gradient(180deg,_#f8fbff_0%,_#eef4fb_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <section className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(20,28,36,0.12)] backdrop-blur">
          <p className="mb-3 text-paragraph-14 font-medium uppercase tracking-[0.18em] text-brand/75">
            Shift Session
          </p>
          <h1 className="text-heading-2 text-foreground">
            Главная
          </h1>
          <p className="mt-3 text-paragraph-16 text-muted-foreground">
            Добро пожаловать,
            {' '}
            <span className="font-medium text-foreground">
              {user?.firstname || user?.phone}
            </span>
            .
          </p>
          <p className="mt-2 text-paragraph-14 text-muted-foreground">
            Сессия успешно восстановлена из cookie и подтверждена через `/api/users/session`.
          </p>
          <Button className="mt-8" variant="outline" onClick={logout} type="button">
            Выйти
          </Button>
        </section>
      </div>
    </main>
  )
}
