import { Edit3, Eye, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  bulkGallery,
  deleteGalleryItem,
  getAdminGallery,
} from "../../features/gallery/api/galleryApi";
import type { GalleryItem } from "../../features/gallery/types/gallery";
import { getAdminArtists } from "../../features/artists/api/artistApi";
import type { Artist } from "../../features/artists/types/artist";
import { getAdminTattooStyles } from "../../features/tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../features/tattooStyles/types/tattooStyle";

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [styles, setStyles] = useState<TattooStyle[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [artistId, setArtistId] = useState("");
  const [styleId, setStyleId] = useState("");
  const [publication, setPublication] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: "16", publication });
    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (artistId) params.set("artistId", artistId);
    if (styleId) params.set("styleId", styleId);
    return getAdminGallery(`?${params}`)
      .then((data) => {
        setItems(data.items);
        setTotalPages(data.pagination.totalPages);
        setSelected([]);
      })
      .catch((reason: Error) => setError(reason.message));
  }, [artistId, page, publication, search, styleId, type]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void getAdminArtists().then((data) => setArtists(data.items));
    void getAdminTattooStyles().then((data) => setStyles(data.items));
  }, []);
  async function action(actionName: string) {
    if (!selected.length) return;
    if (
      actionName === "DELETE" &&
      !window.confirm(`Delete ${selected.length} images from the website and Cloudinary?`)
    )
      return;
    setBusy(true);
    try {
      await bulkGallery(selected, actionName);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update images.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(item: GalleryItem) {
    if (!window.confirm("Delete this image from the website and Cloudinary?")) return;
    setBusy(true);
    try {
      await deleteGalleryItem(item._id);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete image.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Manage tattoo work, client moments and studio photography."
        action={
          <Link className="admin-primary" to="/admin/gallery/upload">
            <Plus />
            Upload images
          </Link>
        }
      />
      <section className="admin-filters admin-gallery-filters">
        <input
          placeholder="Search title or caption"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All types</option>
          <option value="TATTOO_WORK">Tattoo work</option>
          <option value="CUSTOMER_PHOTO">Customers</option>
          <option value="STUDIO_PHOTO">Studio</option>
        </select>
        <select
          value={artistId}
          onChange={(event) => {
            setArtistId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All artists</option>
          {artists.map((artist) => (
            <option key={artist._id} value={artist._id}>
              {artist.displayName || artist.fullName}
            </option>
          ))}
        </select>
        <select
          value={styleId}
          onChange={(event) => {
            setStyleId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All styles</option>
          {styles.map((style) => (
            <option key={style._id} value={style._id}>
              {style.name}
            </option>
          ))}
        </select>
        <select
          value={publication}
          onChange={(event) => {
            setPublication(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">All visibility</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </section>
      {selected.length ? (
        <div className="admin-gallery-bulk">
          <strong>{selected.length} selected</strong>
          <button disabled={busy} onClick={() => void action("PUBLISH")}>
            Publish
          </button>
          <button disabled={busy} onClick={() => void action("UNPUBLISH")}>
            Unpublish
          </button>
          <button disabled={busy} onClick={() => void action("FEATURE")}>
            Feature
          </button>
          <button disabled={busy} onClick={() => void action("UNFEATURE")}>
            Unfeature
          </button>
          <button disabled={busy} onClick={() => void action("DELETE")}>
            Delete
          </button>
        </div>
      ) : null}
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-gallery-grid">
        {items.map((item) => (
          <article key={item._id} className={selected.includes(item._id) ? "is-selected" : ""}>
            <label className="admin-gallery-select">
              <input
                type="checkbox"
                checked={selected.includes(item._id)}
                onChange={(event) =>
                  setSelected((current) =>
                    event.target.checked
                      ? [...current, item._id]
                      : current.filter((id) => id !== item._id),
                  )
                }
              />
              <span>Select image</span>
            </label>
            <img src={item.image.url} alt={item.image.alt} loading="lazy" />
            <div>
              <p>{item.type.replaceAll("_", " ")}</p>
              <h3>{item.title || item.image.alt || "Untitled draft"}</h3>
              <span>{item.artistId?.displayName || item.artistId?.fullName || "No artist"}</span>
              <small>
                {item.tattooStyleIds.map((style) => style.name).join(" · ") || "No styles"}
              </small>
              <div className="admin-gallery-status">
                <i className={item.isPublished ? "is-live" : ""}>
                  {item.isPublished ? "Published" : "Draft"}
                </i>
                {item.isFeatured ? <i>Featured</i> : null}
              </div>
              <nav>
                <Link title="Edit" to={`/admin/gallery/${item._id}/edit`}>
                  <Edit3 />
                </Link>
                {item.isPublished ? (
                  <a title="Preview" href={`/gallery`} target="_blank">
                    <Eye />
                  </a>
                ) : null}
                <button title="Delete" disabled={busy} onClick={() => void remove(item)}>
                  <Trash2 />
                </button>
              </nav>
            </div>
          </article>
        ))}
      </section>
      {!items.length ? <p className="admin-empty">No gallery images match this view.</p> : null}
      {totalPages > 1 ? (
        <div className="admin-gallery-pages">
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </>
  );
}
