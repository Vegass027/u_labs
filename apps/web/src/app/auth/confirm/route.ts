import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') || '/'

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error && data.user) {
      if (type === 'signup' || type === 'invite') {
        const role = data.user.user_metadata?.role || 'client'
        const fullName = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || ''

        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          app_metadata: { role }
        })

        await supabaseAdmin
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role: role,
            password_hash: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' })

        redirectTo.pathname = '/login'
        redirectTo.searchParams.set('confirmed', 'true')
        redirectTo.searchParams.set('email', data.user.email!)
        
        const response = NextResponse.redirect(redirectTo)
        
        const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]
        response.cookies.delete(`sb-${projectId}-auth-token`)
        response.cookies.delete(`sb-${projectId}-auth-token.0`)
        response.cookies.delete(`sb-${projectId}-auth-token.1`)
        
        return response
      } else if (type === 'recovery') {
        redirectTo.pathname = '/auth/reset-password'
        return NextResponse.redirect(redirectTo)
      }
    }
  }

  redirectTo.pathname = '/login'
  redirectTo.searchParams.set('error', 'email_confirmation_failed')
  return NextResponse.redirect(redirectTo)
}
