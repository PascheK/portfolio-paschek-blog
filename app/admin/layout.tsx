import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { logoutAdmin } from "@/app/actions/admin";
import { metaData } from "@/lib/config";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | Admin — ${metaData.name}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell logoutAction={logoutAdmin}>{children}</AdminShell>;
}
