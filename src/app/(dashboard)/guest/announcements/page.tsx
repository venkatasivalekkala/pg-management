"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Megaphone, Wrench, AlertCircle, Calendar, Pin } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  createdAt: string;
  author?: { name: string };
}

const typeConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  GENERAL: { color: "text-blue-700", bg: "bg-blue-100", icon: Megaphone },
  MAINTENANCE: { color: "text-yellow-700", bg: "bg-yellow-100", icon: Wrench },
  EMERGENCY: { color: "text-red-700", bg: "bg-red-100", icon: AlertCircle },
  EVENT: { color: "text-green-700", bg: "bg-green-100", icon: Calendar },
};

export default function GuestAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filterType, setFilterType] = useState("ALL");

  const { loading, error, get, setError } = useApi();

  const fetchAnnouncements = useCallback(async () => {
    const res = await get("/api/announcements");
    if (res) setAnnouncements(Array.isArray(res) ? res : res.data || []);
  }, [get]);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const filtered = filterType === "ALL" ? announcements : announcements.filter(a => a.type === filterType);
  const sorted = [...filtered].sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <p className="text-sm text-gray-500 mt-1">Stay updated with the latest notices</p>
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
          <p className="font-medium">No announcements</p>
          <p className="text-sm mt-1">Check back later for updates from your PG management.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => {
            const cfg = typeConfig[a.type] || typeConfig.GENERAL;
            const Icon = cfg.icon;
            return (
              <Card key={a.id} className={a.isPinned ? "border-indigo-200 bg-indigo-50/30" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {a.isPinned && <Pin className="w-3.5 h-3.5 text-indigo-600" />}
                        <h3 className="font-semibold text-gray-900">{a.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.color}`}>
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
