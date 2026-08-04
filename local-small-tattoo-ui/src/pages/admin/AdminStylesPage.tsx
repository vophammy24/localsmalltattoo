import { ArrowDown, ArrowUp, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import {
  archiveTattooStyle,
  getAdminTattooStyles,
  reorderTattooStyles,
  saveTattooStyle,
} from "../../features/tattooStyles/api/tattooStyleApi";
import type { TattooStyle } from "../../features/tattooStyles/types/tattooStyle";

export function AdminStylesPage() {
  const [items, setItems] = useState<TattooStyle[]>([]);
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [publication, setPublication] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (applied) params.set("search", applied);
    if (publication) params.set("publication", publication);
    return getAdminTattooStyles(params.size ? `?${params}` : "")
      .then((data) => setItems(data.items))
      .catch((reason: Error) => setError(reason.message));
  }, [applied, publication]);
  useEffect(() => {
    void load();
  }, [load]);
  function submit(event: FormEvent) {
    event.preventDefault();
    setApplied(search);
  }
  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setItems(next);
    setBusy("order");
    try {
      await reorderTattooStyles(
        next.map((style, order) => ({ id: style._id, displayOrder: order })),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to reorder styles.");
      await load();
    } finally {
      setBusy("");
    }
  }
  async function toggle(style: TattooStyle) {
    setBusy(style._id);
    try {
      await saveTattooStyle(
        {
          name: style.name,
          slug: style.slug,
          shortDescription: style.shortDescription,
          description: style.description,
          coverAlt: style.coverImage?.alt ?? "",
          isFeatured: style.isFeatured,
          isPublished: !style.isPublished,
          displayOrder: style.displayOrder,
        },
        null,
        style._id,
      );
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update style.");
    } finally {
      setBusy("");
    }
  }
  async function archive(style: TattooStyle) {
    if (!window.confirm(`Archive ${style.name}?`)) return;
    setBusy(style._id);
    try {
      await archiveTattooStyle(style._id);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to archive style.");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <AdminPageHeader
        title="Tattoo Styles"
        description="Manage the disciplines displayed across the public website."
        action={
          <Link className="admin-primary" to="/admin/styles/new">
            <Plus />
            New style
          </Link>
        }
      />
      <form className="admin-filters admin-style-filters" onSubmit={submit}>
        <input
          placeholder="Search style name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={publication} onChange={(event) => setPublication(event.target.value)}>
          <option value="">All visibility</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <button className="admin-primary">Search</button>
      </form>
      {error ? <p className="admin-error">{error}</p> : null}
      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>Style</th>
                <th>Slug</th>
                <th>Featured</th>
                <th>Published</th>
                <th>Order</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((style, index) => (
                <tr key={style._id}>
                  <td>
                    {style.coverImage ? (
                      <img className="admin-style-cover" src={style.coverImage.url} alt="" />
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>
                    <strong>{style.name}</strong>
                  </td>
                  <td>{style.slug}</td>
                  <td>{style.isFeatured ? "Yes" : "No"}</td>
                  <td>
                    <button
                      className={`admin-publication ${style.isPublished ? "is-published" : ""}`}
                      disabled={busy === style._id}
                      onClick={() => void toggle(style)}
                    >
                      {style.status}
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
                  <td>{new Date(style.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link title="Edit" to={`/admin/styles/${style._id}/edit`}>
                        <Pencil />
                      </Link>
                      {style.isPublished ? (
                        <a title="Preview" href={`/styles#${style.slug}`} target="_blank">
                          <Eye />
                        </a>
                      ) : null}
                      <button
                        title="Archive"
                        disabled={busy === style._id}
                        onClick={() => void archive(style)}
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
        {items.length === 0 ? (
          <p className="admin-empty">No tattoo styles match this view.</p>
        ) : null}
      </section>
    </>
  );
}
