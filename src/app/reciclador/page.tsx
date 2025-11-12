import { createServerSupabaseClient } from '@/lib/supabase/server';
import RecicladorDashboard from '@/components/dashboard/RecicladorDashboard';
import { Profile } from '@/types/database.types';

export default async function RecicladorPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return <RecicladorDashboard profile={profile as Profile} />;
}
