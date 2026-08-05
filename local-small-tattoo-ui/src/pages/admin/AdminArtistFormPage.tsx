import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminArtistForm } from "../../features/admin/artists/AdminArtistForm";
import { getAdminArtist, saveArtist } from "../../features/artists/api/artistApi";
import type { Artist, ArtistFormValues } from "../../features/artists/types/artist";
import { getAdminTattooStyles } from "../../features/tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../features/tattooStyles/types/tattooStyle";
export function AdminArtistFormPage() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<Artist>();
  const [styles, setStyles] = useState<TattooStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      getAdminTattooStyles(),
      artistId ? getAdminArtist(artistId) : Promise.resolve(undefined),
    ])
      .then(([styleData, artistData]) => {
        setStyles(styleData.items.filter((style) => style.status !== "ARCHIVED"));
        setArtist(artistData?.artist);
      })
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [artistId]);
  async function save(values: ArtistFormValues, profile: File | null, cover: File | null) {
    setBusy(true);
    setError("");
    try {
      const result = await saveArtist(values, profile, cover, artistId);
      setArtist(result.artist);
      if (!artistId) navigate(`/admin/artists/${result.artist._id}/edit`, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save artist.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p className="admin-loading">Loading artist...</p>;
  return (
    <>
      <AdminPageHeader
        title={
          artistId ? `Edit ${artist?.displayName || artist?.fullName || "artist"}` : "New artist"
        }
        description="Manage profile, specialties, media, and public visibility."
        action={<Link to="/admin/artists">Back to artists</Link>}
      />
      {error ? <p className="admin-error">{error}</p> : null}
      <AdminArtistForm
        key={artist?._id ?? "new"}
        artist={artist}
        styles={styles}
        busy={busy}
        onSave={save}
      />
    </>
  );
}
