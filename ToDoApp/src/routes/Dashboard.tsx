import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addItem, changeItemStatus, deleteItem, editItem, getItems } from "../lib/todos";
import { clearSession, getSession } from "../lib/session";
import type { TodoItem, GetItemsSuccess } from "../lib/types";

type Tab = "active" | "inactive";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getSession(), []);
  const [tab, setTab] = useState<Tab>("active");
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/signin", { replace: true });
    }
  }, [navigate, user]);

  async function refresh() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getItems(tab, user.id);
      if (res && (res as GetItemsSuccess).status === 200 && (res as GetItemsSuccess).data) {
        const map = (res as GetItemsSuccess).data as Record<string, TodoItem>;
        const arr = Object.values(map);
        setItems(arr);
      } else {
        setItems([]);
      }
    } catch {
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.id]);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const form = e.currentTarget;
    const formData = new FormData(form);
    const item_name = String(formData.get("item_name") || "").trim();
    const item_description = String(formData.get("item_description") || "").trim();
    if (!item_name) return;
    setActionError(null);
    try {
      const res = await addItem({ item_name, item_description, user_id: user.id });
      // eslint-disable-next-line no-console
      console.log("addItem response", res);
      form.reset();
      await refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("addItem error", err);
      setActionError(err instanceof Error ? err.message : "Failed to add item");
    }
  }

  async function onEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (editId == null) return;
    await editItem({ item_name: editName.trim(), item_description: editDesc.trim(), item_id: editId });
    setEditOpen(false);
    setEditId(null);
    setEditName("");
    setEditDesc("");
    refresh();
  }

  // removed unused onToggle; handled via confirmation modal

  async function onDeleteConfirm() {
    if (deleteId == null) return;
    await deleteItem(deleteId);
    setDeleteOpen(false);
    setDeleteId(null);
    refresh();
  }

  function logout() {
    clearSession();
    navigate("/signin", { replace: true });
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">To Do</h1>
          {user && <p className="text-xs text-black/60 dark:text-white/70">Signed in as {user.fname} {user.lname}</p>}
        </div>
        <button onClick={logout} className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">Sign out</button>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-14">
        <div className="mb-4 inline-flex rounded-md border border-black/10 bg-white/60 p-1 dark:bg-black/40">
          {(["active", "inactive"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded px-3 py-1.5 text-sm ${tab === t ? "bg-blue-600 text-white" : "text-black/80 hover:bg-black/5 dark:text-white/80 dark:hover:bg-white/5"}`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={onAdd} className="mb-6 grid gap-3 rounded-xl border border-black/10 bg-white/60 p-4 dark:bg-black/40 sm:grid-cols-5">
          <input name="item_name" required placeholder="Task title" className="sm:col-span-2 rounded-md border border-black/10 bg-white/90 px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-blue-500 dark:bg-black/60" />
          <input name="item_description" required placeholder="Description" className="sm:col-span-2 rounded-md border border-black/10 bg-white/90 px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-blue-500 dark:bg-black/60" />
          <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Add</button>
        </form>

        <div className="space-y-3">
          {loading && <p className="text-sm">Loading...</p>}
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {actionError && <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>}
          {!loading && items.length === 0 && <p className="text-sm text-black/70 dark:text-white/70">No items</p>}
          {items.map((it) => (
            <div key={it.item_id} className="flex items-start justify-between rounded-lg border border-black/10 bg-white/60 p-4 dark:bg-black/40">
              <div>
                <p className="font-medium">{it.item_name}</p>
                {it.item_description && <p className="text-sm text-black/70 dark:text-white/70">{it.item_description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditOpen(true); setEditId(it.item_id); setEditName(it.item_name); setEditDesc(it.item_description || ""); }} className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5">Edit</button>
                <button onClick={() => { setConfirmOpen(true); setConfirmId(it.item_id); }} className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5">{it.status === "active" ? "Done" : "Activate"}</button>
                <button onClick={() => { setDeleteOpen(true); setDeleteId(it.item_id); }} className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
      {editOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-zinc-900">
            <h2 className="text-base font-semibold">Edit task</h2>
            <form onSubmit={onEditSave} className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs">Title</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-1 ring-transparent focus:ring-blue-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs">Description</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full resize-y rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-1 ring-transparent focus:ring-blue-500" />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => { setEditOpen(false); }} className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
                <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-zinc-900">
            <h2 className="text-base font-semibold">Mark the task as done?</h2>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmOpen(false)} className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
              <button type="button" onClick={async () => {
                if (confirmId != null) {
                  await changeItemStatus({ status: tab === "active" ? "inactive" : "active", item_id: confirmId });
                  setConfirmOpen(false);
                  setConfirmId(null);
                  refresh();
                }
              }} className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-5 shadow-2xl dark:bg-zinc-900">
            <h2 className="text-base font-semibold">Delete this task?</h2>
            <p className="mt-1 text-xs text-black/70 dark:text-white/70">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-md border border-black/10 px-3 py-1.5 text-xs hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
              <button type="button" onClick={onDeleteConfirm} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


