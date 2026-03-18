import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata = { title: "Post an Ad" };

export default async function NewListingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/listings/new");
  return (
    <div className="post-page page-wrap">
      <div className="post-page__inner">
        <div className="page-header">
          <h1 className="page-title">Post a Free Ad</h1>
          <p className="page-sub">Your listing will be live instantly. No fees, ever.</p>
        </div>
        <div className="card form-card">
          <ListingForm userId={user.id} />
        </div>
      </div>
    </div>
  );
}
