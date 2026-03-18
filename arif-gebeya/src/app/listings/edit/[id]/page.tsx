import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/listings/ListingForm";

export const metadata = { title: "Edit Listing" };

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: listing } = await supabase
    .from("listings").select("*").eq("id", id).eq("seller_id", user.id).single();

  if (!listing) notFound();

  return (
    <div className="post-page page-wrap">
      <div className="post-page__inner">
        <div className="page-header">
          <h1 className="page-title">Edit Listing</h1>
          <p className="page-sub">Update your ad details.</p>
        </div>
        <div className="card form-card">
          <ListingForm userId={user.id} listing={listing} />
        </div>
      </div>
    </div>
  );
}
