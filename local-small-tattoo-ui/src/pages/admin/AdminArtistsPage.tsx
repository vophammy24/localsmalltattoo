import { ArrowDown, ArrowUp, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  archiveArtist,
  getAdminArtists,
  publishArtist,
  reorderArtists,
} from "../../features/artists/api/artistApi";
import type { Artist } from "../../features/artists/types/artist";
import { getAdminTattooStyles } from "../../features/tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../features/tattooStyles/types/tattooStyle";
export function AdminArtistsPage() {
  const [items, setItems] = useState<Artist[]>([]);
  const [styles, setStyles] = useState<TattooStyle[]>([]);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [publication, setPublication] = useState("");
  const [styleId, setStyleId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (applied) params.set("search", applied);
    if (publication) params.set("publication", publication);
    if (styleId) params.set("styleId", styleId);
    return getAdminArtists(params.size ? `?${params}` : "")
      .then((data) => setItems(data.items))
      .catch((reason: Error) => setError(reason.message));
  }, [applied, publication, styleId]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    getAdminTattooStyles()
      .then((data) => setStyles(data.items))
      .catch(() => undefined);
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    setApplied(search);
  }
  async function toggle(artist: Artist) {
    setBusy(artist._id);
    try {
      await publishArtist(artist._id, !artist.isPublished);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update artist.");
    } finally {
      setBusy("");
    }
  }
  async function archive(artist: Artist) {
    if (!window.confirm(`Archive ${artist.displayName || artist.fullName}?`)) return;
    setBusy(artist._id);
    try {
      await archiveArtist(artist._id);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive artist.");
    } finally {
      setBusy("");
    }
  }
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setItems(next);
    setBusy("order");
    try {
      await reorderArtists(next.map((artist, order) => ({ id: artist._id, displayOrder: order })));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reorder artists.");
      await load();
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Artists"
        description="Manage resident artist profiles and specialties."
        action={
          <Link className="admin-primary" to="/admin/artists/new">
            <Plus />
            New artist
          </Link>
        }
      />
      <form className="admin-filters admin-artist-filters" onSubmit={submit}>
        <input
          placeholder="Search artist name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={publication} onChange={(event) => setPublication(event.target.value)}>
          <option value="">All visibility</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={styleId} onChange={(event) => setStyleId(event.target.value)}>
          <option value="">All styles</option>
          {styles.map((style) => (
            <option key={style._id} value={style._id}>
              {style.name}
            </option>
          ))}
        </select>
        <button className="admin-primary">Search</button>
      </form>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Artist</th>
                <th>Role</th>
                <th>Styles</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Order</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((artist, index) => (
                <tr key={artist._id}>
                  <td>
                    {artist.profileImage ? (
                      <img className="admin-style-cover" src={artist.profileImage.url} alt="" />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <strong>{artist.displayName || artist.fullName}</strong>
                    <small>{artist.displayName ? artist.fullName : ""}</small>
                  </td>
                  <td>{artist.role}</td>
                  <td>{artist.tattooStyleIds.map((style) => style.name).join(", ")}</td>
                  <td>{artist.isFeatured ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className={`admin-publication ${artist.isPublished ? "is-published" : ""}`}
                      disabled={busy === artist._id}
                      onClick={() => void toggle(artist)}
                    >
                      {artist.status}
                    </button>
                  </td>
                  <td>
                    <div className="admin-order-actions">
                      <button
                        title="Move up"
                        disabled={index === 0 || busy === "order"}
                        onClick={() => void move(index, -1)}
                      >
                        <ArrowUp />
                      </button>
                      <button
                        title="Move down"
                        disabled={index === items.length - 1 || busy === "order"}
                        onClick={() => void move(index, 1)}
                      >
                        <ArrowDown />
                      </button>
                    </div>
                  </td>
                  <td>{new Date(artist.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link title="Edit" to={`/admin/artists/${artist._id}/edit`}>
                        <Pencil />
                      </Link>
                      {artist.isPublished ? (
                        <a title="Preview" href={`/artists/${artist.slug}`} target="_blank">
                          <Eye />
                        </a>
                      ) : null}
                      <button
                        title="Archive"
                        disabled={busy === artist._id}
                        onClick={() => void archive(artist)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 ? <p className="admin-empty">No artists match this view.</p> : null}
      </section>
    </>
  );
}
