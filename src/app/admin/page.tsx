import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminApp } from "@/components/admin/AdminApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminApp adminName={session.name ?? "Yeralis K."} adminEmail={session.email} />;
}
