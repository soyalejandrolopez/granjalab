import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ProductorDashboard from '@/components/dashboard/ProductorDashboard';
import { Profile } from '@/types/database.types';

export default async function ProductorPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || error) {
    redirect('/login');
  }

  const validProfile = profile as Profile;

  if (validProfile.rol !== 'productor') {
    redirect(`/${validProfile.rol}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={validProfile} />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar profile={validProfile} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <ProductorDashboard profile={validProfile} />
          </div>
        </main>
      </div>
    </div>
  );
}
