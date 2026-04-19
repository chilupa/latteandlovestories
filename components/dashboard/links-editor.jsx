"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { LINK_ICON_OPTIONS } from "@/components/link-icon";
import {
  createLink,
  deleteLink,
  reorderLinks,
  updateLink,
} from "@/app/dashboard/actions";
import { GripVertical, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

function SortableRow({ link }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : 1,
  };

  const [title, setTitle] = useState(link.title);
  const [url, setUrl] = useState(link.url);
  const [icon, setIcon] = useState(link.icon || "");
  const [highlighted, setHighlighted] = useState(link.is_highlighted);
  const [active, setActive] = useState(link.is_active);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const router = useRouter();

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const res = await updateLink({
      id: link.id,
      title,
      url,
      icon: icon || null,
      isHighlighted: highlighted,
      isActive: active,
    });
    setSaving(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Remove this link?")) return;
    setRemoving(true);
    const res = await deleteLink(link.id);
    setRemoving(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card ref={setNodeRef} style={style} className="border-border/90 shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="mt-2 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${link.title}`}
          >
            <GripVertical className="h-5 w-5" aria-hidden />
          </button>
          <form className="min-w-0 flex-1 space-y-3" onSubmit={handleSave}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`t-${link.id}`}>Title</Label>
                <Input
                  id={`t-${link.id}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`u-${link.id}`}>URL</Label>
                <Input
                  id={`u-${link.id}`}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor={`i-${link.id}`}>Icon</Label>
                <select
                  id={`i-${link.id}`}
                  className="flex h-11 w-full rounded-xl border border-border bg-white px-3 text-sm shadow-inner shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                >
                  <option value="">None</option>
                  {LINK_ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={highlighted}
                  onChange={(e) => setHighlighted(e.target.checked)}
                  className="size-4 rounded border-border text-rose-700 focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                />
                Highlight
              </label>
              <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="size-4 rounded border-border text-rose-700 focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                />
                Visible
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Save link
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={removing}
                onClick={handleDelete}
              >
                {removing ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Delete
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export function LinksEditor({ initialLinks }) {
  const router = useRouter();
  const sortedInitial = useMemo(
    () => [...initialLinks].sort((a, b) => a.position - b.position),
    [initialLinks],
  );

  const [items, setItems] = useState(() =>
    sortedInitial.map((l) => l.id),
  );
  const linkMap = useMemo(() => {
    const m = new Map();
    sortedInitial.forEach((l) => m.set(l.id, l));
    return m;
  }, [sortedInitial]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [highlight, setHighlight] = useState(false);
  const [adding, setAdding] = useState(false);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextOrder = arrayMove(items, oldIndex, newIndex);
    setItems(nextOrder);

    const res = await reorderLinks(nextOrder);
    if (res?.error) {
      alert(res.error);
      setItems(sortedInitial.map((l) => l.id));
      return;
    }
    router.refresh();
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    const res = await createLink({
      title,
      url,
      icon: icon || null,
      isHighlighted: highlight,
    });
    setAdding(false);
    if (res?.error) {
      alert(res.error);
      return;
    }
    setTitle("");
    setUrl("");
    setIcon("");
    setHighlight(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-primary/25 bg-muted/40">
        <CardContent className="space-y-4 p-4">
          <p className="font-medium text-foreground">Add a new link</p>
          <form className="space-y-3" onSubmit={handleAdd}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-title">Title</Label>
                <Input
                  id="new-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Shop the collection"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-url">URL</Label>
                <Input
                  id="new-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  required
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-icon">Icon (optional)</Label>
                <select
                  id="new-icon"
                  className="flex h-11 min-w-[140px] rounded-xl border border-border bg-white px-3 text-sm shadow-inner shadow-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                >
                  <option value="">None</option>
                  {LINK_ICON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex cursor-pointer items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={highlight}
                  onChange={(e) => setHighlight(e.target.checked)}
                  className="size-4 rounded border-border text-rose-700 focus-visible:ring-2 focus-visible:ring-[var(--profile-accent,#be185d)]"
                />
                Highlight style
              </label>
            </div>
            <Button type="submit" disabled={adding}>
              {adding ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Add link
            </Button>
          </form>
        </CardContent>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No links yet. Add your first one above.
              </p>
            ) : (
              items.map((id) => {
                const link = linkMap.get(id);
                if (!link) return null;
                return <SortableRow key={id} link={link} />;
              })
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
