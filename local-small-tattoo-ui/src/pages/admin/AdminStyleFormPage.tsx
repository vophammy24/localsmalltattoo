import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { AdminStyleForm } from "../../features/admin/styles/AdminStyleForm";
import { StyleImageManager } from "../../features/admin/styles/StyleImageManager";
import {
  getAdminTattooStyle,
  saveTattooStyle,
} from "../../features/tattooStyles/api/tattooStyleApi";
import type {
  TattooStyle,
  TattooStyleFormValues,
} from "../../features/tattooStyles/types/tattooStyle";

export function AdminStyleFormPage() {
  const { styleId } = useParams();
  const navigate = useNavigate();
  const [style, setStyle] = useState<TattooStyle>();
  const [loading, setLoading] = useState(Boolean(styleId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!styleId) return;
    getAdminTattooStyle(styleId)
      .then((data) => setStyle(data.style))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [styleId]);
  async function save(values: TattooStyleFormValues, cover: File | null, _publish: boolean) {
    setBusy(true);
    setError("");
    try {
      const result = await saveTattooStyle(values, cover, styleId);
      setStyle(result.style);
      if (!styleId) navigate(`/admin/styles/${result.style._id}/edit`, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save style.");
    } finally {
      setBusy(false);
    }
  }
  if (loading) return <p className="admin-loading">Loading style...</p>;
  return (
    <>
      <AdminPageHeader
        title={styleId ? `Edit ${style?.name ?? "style"}` : "New tattoo style"}
        description="Build the public style narrative, media, and visibility."
        action={<Link to="/admin/styles">Back to styles</Link>}
      />
      {error ? <p className="admin-error">{error}</p> : null}
      <div className="admin-style-editor">
        <AdminStyleForm key={style?._id ?? "new"} initialStyle={style} onSave={save} busy={busy} />
        {style ? (
          <StyleImageManager style={style} onChange={setStyle} />
        ) : (
          <section className="admin-panel admin-empty">
            <h2>Gallery images</h2>
            <p>Save the style before adding gallery images.</p>
          </section>
        )}
      </div>
    </>
  );
}
