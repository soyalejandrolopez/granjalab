import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import Navbar from '@/components/layout/Navbar';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Profile } from '@/types/database.types';

export default async function AdminPage() {
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

  if (validProfile.rol !== 'admin') {
    redirect(`/${validProfile.rol}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar profile={validProfile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <AdminDashboard profile={validProfile} />
      </main>
    </div>
  );
}
