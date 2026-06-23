import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminApp } from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  // The dashboard opens without login ONLY for true local development
  // (NODE_ENV=development) or an explicit opt-in (ADMIN_DEV_OPEN=1). See
  // middleware.ts for the matching gate. Staging / unset NODE_ENV is gated.
  const devOpen = process.env.ADMIN_DEV_OPEN === "1" || process.env.NODE_ENV === "development";
  if (!session && !devOpen) redirect("/admin/login");

  const adminName = session?.name ?? "Yeralis K.";
  const adminEmail = session?.email ?? process.env.ADMIN_EMAIL ?? "admin@pathos-yeralis.gr";
  return <AdminApp adminName={adminName} adminEmail={adminEmail} />;
}
