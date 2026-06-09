import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminApp } from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  // In development the dashboard opens without login (see middleware.ts).
  const dev = process.env.NODE_ENV !== "production";
  if (!session && !dev) redirect("/admin/login");

  const adminName = session?.name ?? "Yeralis K.";
  const adminEmail = session?.email ?? process.env.ADMIN_EMAIL ?? "admin@pathos-yeralis.gr";
  return <AdminApp adminName={adminName} adminEmail={adminEmail} />;
}
