import { createServerSupabaseClient } from '@/lib/supabase/server';
import ProductorDashboard from '@/components/dashboard/ProductorDashboard';
import { Profile } from '@/types/database.types';

export default async function ProductorPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return <ProductorDashboard profile={profile as Profile} />;
}
