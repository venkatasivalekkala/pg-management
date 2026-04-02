"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, Pin, AlertCircle, Megaphone, Wrench, Calendar, Trash2, Edit2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  isActive: boolean;
  createdAt: string;
  author?: { name: string };
  property?: { name: string };
}

const typeColors: Record<string, string> = {
  GENERAL: "bg-blue-100 text-blue-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  EMERGENCY: "bg-red-100 text-red-700",
  EVENT: "bg-green-100 text-green-700",
};

const typeIcons: Record<string, React.ElementType> = {
  GENERAL: Megaphone,
  MAINTENANCE: Wrench,
  EMERGENCY: AlertCircle,
  EVENT: Calendar,
};

const defaultForm = { title: "", content: "", type: "GENERAL", isPinned: false, propertyId: "" };

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [filterType, setFilterType] = useState("ALL");
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const { loading, error, get, setError } = useApi();
  const { loading: mutating, error: mutateError, post, put, del, setError: setMutateError } = useApi();
  const propsApi = useApi();

  const fetchAnnouncements = useCallback(async () => {
    const res = await get("/api/announcements");
    if (res) setAnnouncements(Array.isArray(res) ? res : res.data || []);
  }, [get]);

  const fetchProperties = useCallback(async () => {
    const res = await propsApi.get("/api/properties");
    if (res) setProperties(Array.isArray(res) ? res : res.data || []);
  }, [propsApi]);

  useEffect(() => { fetchAnnouncements(); fetchProperties(); }, [fetchAnnouncements, fetchProperties]);

  const handleSubmit = async () => {
    if (!form.title || !form.content) { setMutateError("Title and content are required"); return; }
    const payload = { ...form, isPinned: form.isPinned, propertyId: form.propertyId || properties[0]?.id };
    const res = editingId
      ? await put(`/api/announcements/${editingId}`, payload)
      : await post("/api/announcements", payload);
    if (res) {
      setForm(defaultForm);
      setEditingId(null);
      setShowModal(false);
      fetchAnnouncements();
    }
  };

  const handleEdit = (a: Announcement) => {
    setForm({ title: a.title, content: a.content, type: a.type, isPinned: a.isPinned, propertyId: "" });
    setEditingId(a.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    const res = await del(`/api/announcements/${id}`);
    if (res) fetchAnnouncements();
  };

  const handleTogglePin = async (a: Announcement) => {
    await put(`/api/announcements/${a.id}`, { isPinned: !a.isPinned });
    fetchAnnouncements();
  };

  const filtered = filterType === "ALL" ? announcements : announcements.filter(a => a.type === filterType);
  const sorted = [...filtered].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Broadcast notices to all residents</p>
        </div>
        <Button onClick={() => { setForm(defaultForm); setEditingId(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Announcement
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500">✕</button>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {["ALL", "GENERAL", "MAINTENANCE", "EMERGENCY", "EVENT"].map(t => (
          <button key={t} onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterType === t ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading && announcements.length === 0 ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : sorted.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No announcements yet</p>
          <p className="text-sm mt-1">Create your first announcement to notify residents.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => {
            const TypeIcon = typeIcons[a.type] || Megaphone;
            return (
              <Card key={a.id} className={a.isPinned ? "border-indigo-200 bg-indigo-50/30" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeColors[a.type]?.split(" ")[0] || "bg-gray-100"}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {a.isPinned && <Pin className="w-3.5 h-3.5 text-indigo-600" />}
                          <h3 className="font-semibold text-gray-900">{a.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[a.type] || "bg-gray-100 text-gray-600"}`}>
                            {a.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{a.content}</p>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                          <span>{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {a.author && <span>by {a.author.name}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-3">
                      <button onClick={() => handleTogglePin(a)} className="p-1.5 rounded hover:bg-gray-100" title={a.isPinned ? "Unpin" : "Pin"}>
                        <Pin className={`w-4 h-4 ${a.isPinned ? "text-indigo-600" : "text-gray-400"}`} />
                      </button>
                      <button onClick={() => handleEdit(a)} className="p-1.5 rounded hover:bg-gray-100">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded hover:bg-red-50">
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader><ModalTitle>{editingId ? "Edit Announcement" : "New Announcement"}</ModalTitle></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {mutateError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{mutateError}</div>}
            <Input label="Title" placeholder="Announcement title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea label="Content" placeholder="Write your announcement..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="GENERAL">General</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="EVENT">Event</option>
              </select>
            </div>
            {properties.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={form.propertyId} onChange={e => setForm({ ...form, propertyId: e.target.value })}>
                  <option value="">Select property</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="rounded" />
              <span className="text-sm text-gray-700">Pin this announcement</span>
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={mutating}>{mutating ? "Saving..." : editingId ? "Update" : "Publish"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
