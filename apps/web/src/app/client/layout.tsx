import { createClient } from '@/lib/supabase/server';
import ClientMenuBar from '@/app/client/ClientMenuBar';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-center">
          <ClientMenuBar />
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 xl:px-12">
        {children}
      </main>
    </div>
  );
}
