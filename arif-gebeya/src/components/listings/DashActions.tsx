"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, Pencil, Trash2, Loader2, PauseCircle, PlayCircle } from "lucide-react";

export function DashActions({ listingId, isActive }: { listingId: string; isActive: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this listing permanently?")) return;
    setDeleting(true);
    await supabase.from("listings").delete().eq("id", listingId);
    router.refresh();
  };

  const handleToggle = async () => {
    setToggling(true);
    await supabase.from("listings").update({ is_active: !isActive }).eq("id", listingId);
    router.refresh();
    setToggling(false);
  };

  return (
    <div className="dash-listing-actions">
      <Link href={`/listings/${listingId}`} title="Preview" className="dash-act-btn dash-act-btn--view"><Eye size={15} /></Link>
      <Link href={`/listings/edit/${listingId}`} title="Edit"    className="dash-act-btn dash-act-btn--edit"><Pencil size={15} /></Link>
      <button title={isActive ? "Pause" : "Activate"} className="dash-act-btn dash-act-btn--view" onClick={handleToggle} disabled={toggling}>
        {toggling ? <Loader2 size={15} className="animate-spin" /> : isActive ? <PauseCircle size={15} /> : <PlayCircle size={15} />}
      </button>
      <button title="Delete" className="dash-act-btn dash-act-btn--delete" onClick={handleDelete} disabled={deleting}>
        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
