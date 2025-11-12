import { createServerSupabaseClient } from '@/lib/supabase/server';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { Profile } from '@/types/database.types';

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return <AdminDashboard profile={profile as Profile} />;
}
