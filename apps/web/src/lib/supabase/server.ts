import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const all = cookieStore.getAll()
          const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
          const cookieName = `sb-${projectId}-auth-token`

          // Собираем chunked cookies в один
          const chunk0 = all.find(c => c.name === `${cookieName}.0`)
          const chunk1 = all.find(c => c.name === `${cookieName}.1`)

          if (chunk0) {
            const combined = chunk0.value + (chunk1?.value || '')
            const decoded = Buffer.from(combined.replace('base64-', ''), 'base64').toString('utf-8')
            return [
              ...all.filter(c => !c.name.startsWith(cookieName)),
              { name: cookieName, value: decoded }
            ]
          }

          // Старый единый формат
          return all.map(c => {
            if (c.name === cookieName && c.value.startsWith('base64-')) {
              return { name: c.name, value: Buffer.from(c.value.replace('base64-', ''), 'base64').toString('utf-8') }
            }
            return c
          })
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
