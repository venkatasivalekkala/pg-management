"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Star, Edit2, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  guest?: { id: string; name: string };
  property?: { id: string; name: string };
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hover || value) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function GuestReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ rating: 0, comment: "", propertyId: "" });
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);

  const { loading, error, get, setError } = useApi();
  const { loading: submitting, error: submitError, post, put, setError: setSubmitError } = useApi();
  const propsApi = useApi();

  const fetchReviews = useCallback(async () => {
    const res = await get("/api/reviews");
    if (res) {
      const all = Array.isArray(res) ? res : res.data || [];
      setReviews(all);
    }
  }, [get]);

  const fetchProperties = useCallback(async () => {
    const res = await propsApi.get("/api/properties");
    if (res) setProperties(Array.isArray(res) ? res : res.data || []);
  }, [propsApi]);

  useEffect(() => { fetchReviews(); fetchProperties(); }, [fetchReviews, fetchProperties]);

  const handleSubmit = async () => {
    if (form.rating === 0) { setSubmitError("Please select a rating"); return; }
    const propertyId = form.propertyId || properties[0]?.id;
    if (!propertyId) { setSubmitError("No property available"); return; }

    const payload = { propertyId, rating: form.rating, comment: form.comment || undefined };
    const res = myReview
      ? await put(`/api/reviews/${myReview.id}`, payload)
      : await post("/api/reviews", payload);
    if (res) {
      setShowModal(false);
      setForm({ rating: 0, comment: "", propertyId: "" });
      fetchReviews();
    }
  };

  const openEditReview = (review?: Review) => {
    if (review) {
      setMyReview(review);
      setForm({ rating: review.rating, comment: review.comment || "", propertyId: review.property?.id || "" });
    } else {
      setMyReview(null);
      setForm({ rating: 0, comment: "", propertyId: "" });
    }
    setShowModal(true);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Share your experience and read others</p>
        </div>
        <Button onClick={() => openEditReview()}>
          <Edit2 className="w-4 h-4 mr-2" /> Write Review
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500">✕</button>
        </div>
      )}

      {/* Rating Summary */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl font-bold text-indigo-700">{avgRating}</div>
          <div className="flex justify-center mt-2">
            <StarRating value={Math.round(parseFloat(avgRating) || 0)} readonly />
          </div>
          <p className="text-sm text-gray-600 mt-2">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
        </CardContent>
      </Card>

      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to share your experience!</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {r.guest?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{r.guest?.name || "Anonymous"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating value={r.rating} readonly />
                        <span className="text-sm text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
                      {r.property && <p className="text-xs text-gray-400 mt-1">{r.property.name}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader><ModalTitle>{myReview ? "Edit Review" : "Write a Review"}</ModalTitle></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {submitError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{submitError}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
              <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
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
            <Textarea
              label="Your Review (optional)"
              placeholder="Share your experience..."
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              rows={4}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
