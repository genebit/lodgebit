import LenisProvider from "@/components/LenisProvider";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      <div className="theme-light">{children}</div>
    </LenisProvider>
  );
}
