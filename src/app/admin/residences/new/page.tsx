import type { Metadata } from "next";
import ResidenceForm from "@/components/admin/ResidenceForm";

export const metadata: Metadata = { title: "New Residence" };

export default function NewResidencePage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">New Residence</h2>
      <ResidenceForm />
    </div>
  );
}
