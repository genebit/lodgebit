import { auth } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import NavigationLoader from "@/components/NavigationLoader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) return <>{children}</>;

  const user = {
    name: session.user?.name ?? null,
    email: session.user?.email ?? null,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <NavigationLoader />
      <AdminSidebar user={user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/40 pb-20 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
