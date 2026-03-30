import { createClient } from "@/lib/supabase/server";
import UnitForm from "@/components/admin/UnitForm";

export default async function NewUnitPage() {
  const supabase = await createClient();
  const { data: residences } = await supabase.from("residences").select("id, name").order("name");

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">New Unit</h2>
      <UnitForm residences={residences ?? []} />
    </div>
  );
}
