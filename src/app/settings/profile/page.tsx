import { UserRoundCog } from "lucide-react";
import { notFound } from "next/navigation";

import { ProfileForms } from "@/components/staff/profile-forms";
import { getCurrentProfile } from "@/features/staff/services/staff-service";
import { requireAuth } from "@/lib/auth-utils";

export default async function ProfilePage() {
  const session = await requireAuth();
  const profile = await getCurrentProfile(session.user.id);
  if (!profile) notFound();
  return <div className="mx-auto max-w-5xl space-y-5 pb-8"><header><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary"><UserRoundCog aria-hidden="true" className="size-4" />Account settings</div><h1 className="mt-2 text-2xl font-black tracking-tight text-secondary sm:text-3xl">My profile</h1><p className="mt-1 text-sm text-muted-foreground">Update your contact information or securely change your password.</p></header><ProfileForms profile={{ fullName: profile.fullName, username: profile.username, email: profile.email ?? "", phone: profile.phone ?? "", avatar: profile.avatar ?? "", role: profile.role }} /></div>;
}
