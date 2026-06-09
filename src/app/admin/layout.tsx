// The AdminApp owns all chrome (sidebar/topbar). This layout is a passthrough.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
