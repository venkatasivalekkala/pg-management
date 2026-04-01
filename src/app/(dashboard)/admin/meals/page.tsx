"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/loading";
import { useApi } from "@/hooks/use-api";
import { Plus, UtensilsCrossed, Star, Coffee, Sun, Moon, AlertCircle } from "lucide-react";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const fullDayNames: Record<string, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

type MealType = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";

interface Meal {
  id: string;
  propertyId: string;
  date: string;
  mealType: MealType;
  menuItems: string[];
  expectedCount?: number;
  actualCount?: number;
  feedbackAvgRating?: number;
  property?: { id: string; name: string };
  _count?: { optIns: number };
}

interface Property {
  id: string;
  name: string;
}

/** Return the Monday of the week that contains `d`. */
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Format as YYYY-MM-DD. */
function fmtDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

/** Get the date for a weekday offset (Mon=0 .. Sun=6) from a Monday. */
function dateForDay(monday: Date, dayIndex: number): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

function getTodayDayIndex(): number {
  const jsDay = new Date().getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1; // 0=Mon
}

export default function MealsPage() {
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [selectedDay, setSelectedDay] = useState(weekDays[getTodayDayIndex()]);
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  // Track existing meal IDs for the selected day so we can PUT instead of POST
  const [editingIds, setEditingIds] = useState<{ BREAKFAST?: string; LUNCH?: string; DINNER?: string }>({});

  // Data
  const [meals, setMeals] = useState<Meal[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const mealsApi = useApi();
  const mutationApi = useApi();
  const propertiesApi = useApi();

  const monday = getMonday(new Date());

  // ---- Fetch meals for the current week ----
  const fetchMeals = useCallback(async () => {
    const params = new URLSearchParams({ limit: "100" });
    if (selectedPropertyId) params.set("propertyId", selectedPropertyId);

    // Fetch all 7 days at once by using the Monday date and a large limit.
    // The API sorts by date desc, so we just grab all for this week.
    const weekDates = Array.from({ length: 7 }, (_, i) => fmtDate(dateForDay(monday, i)));
    // We'll fetch without date filter and rely on the weekly range locally,
    // or fetch each day. For simplicity, fetch all recent meals.
    const result = await mealsApi.get(`/api/meals?${params.toString()}`);
    if (result?.data) {
      setMeals(result.data);
    }
  }, [selectedPropertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Fetch properties ----
  const fetchProperties = useCallback(async () => {
    const result = await propertiesApi.get("/api/properties?limit=100");
    if (result?.data) {
      setProperties(result.data);
      // Auto-select first property if none selected
      if (!selectedPropertyId && result.data.length > 0) {
        setSelectedPropertyId(result.data[0].id);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProperties();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedPropertyId) {
      fetchMeals();
    }
  }, [selectedPropertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Build the weekly menu grid from real data ----
  function getMealsForDay(dayIndex: number): { breakfast: string; lunch: string; dinner: string } {
    const dateStr = fmtDate(dateForDay(monday, dayIndex));
    const dayMeals = meals.filter((m) => m.date?.startsWith(dateStr));
    const find = (type: MealType) =>
      dayMeals.find((m) => m.mealType === type)?.menuItems?.join(", ") || "—";
    return {
      breakfast: find("BREAKFAST"),
      lunch: find("LUNCH"),
      dinner: find("DINNER"),
    };
  }

  // ---- Compute today's stats from real data ----
  const todayStr = fmtDate(new Date());
  const todayMeals = meals.filter((m) => m.date?.startsWith(todayStr));
  const findTodayMeal = (type: MealType) => todayMeals.find((m) => m.mealType === type);

  const todayBreakfast = findTodayMeal("BREAKFAST");
  const todayLunch = findTodayMeal("LUNCH");
  const todayDinner = findTodayMeal("DINNER");

  const optCount = (meal?: Meal) => meal?._count?.optIns ?? 0;
  const expCount = (meal?: Meal) => meal?.expectedCount ?? 0;

  const allRatings = todayMeals
    .map((m) => m.feedbackAvgRating)
    .filter((r): r is number => r != null && r > 0);
  const avgRating =
    allRatings.length > 0 ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : "—";

  // ---- Open modal with pre-filled data ----
  function openModal() {
    const dayIndex = getTodayDayIndex();
    const dayKey = weekDays[dayIndex];
    setSelectedDay(dayKey);
    prefillForDay(dayIndex);
    setShowModal(true);
  }

  function prefillForDay(dayIndex: number) {
    const dateStr = fmtDate(dateForDay(monday, dayIndex));
    const dayMeals = meals.filter((m) => m.date?.startsWith(dateStr));
    const find = (type: MealType) => dayMeals.find((m) => m.mealType === type);

    const bMeal = find("BREAKFAST");
    const lMeal = find("LUNCH");
    const dMeal = find("DINNER");

    setBreakfast(bMeal?.menuItems?.join(", ") || "");
    setLunch(lMeal?.menuItems?.join(", ") || "");
    setDinner(dMeal?.menuItems?.join(", ") || "");
    setEditingIds({
      BREAKFAST: bMeal?.id,
      LUNCH: lMeal?.id,
      DINNER: dMeal?.id,
    });
  }

  function handleDayChange(day: string) {
    setSelectedDay(day);
    const idx = weekDays.indexOf(day);
    if (idx >= 0) prefillForDay(idx);
  }

  // ---- Save meals ----
  async function handleSave() {
    const dayIndex = weekDays.indexOf(selectedDay);
    const date = fmtDate(dateForDay(monday, dayIndex));

    const mealEntries: { type: MealType; items: string; existingId?: string }[] = [
      { type: "BREAKFAST", items: breakfast, existingId: editingIds.BREAKFAST },
      { type: "LUNCH", items: lunch, existingId: editingIds.LUNCH },
      { type: "DINNER", items: dinner, existingId: editingIds.DINNER },
    ];

    mutationApi.setError(null);

    for (const entry of mealEntries) {
      const itemsArray = entry.items
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (itemsArray.length === 0) continue;

      if (entry.existingId) {
        // PUT update
        const result = await mutationApi.put(`/api/meals/${entry.existingId}`, {
          menuItems: itemsArray,
        });
        if (!result) return; // stop on error
      } else {
        // POST create
        const result = await mutationApi.post("/api/meals", {
          propertyId: selectedPropertyId,
          date,
          mealType: entry.type,
          menuItems: itemsArray,
        });
        if (!result) return; // stop on error
      }
    }

    setShowModal(false);
    await fetchMeals();
  }

  // ---- Week label ----
  const weekEnd = dateForDay(monday, 6);
  const weekLabel = `${monday.toLocaleDateString("en-US", { month: "long", year: "numeric" })} — Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const todayIndex = getTodayDayIndex();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage weekly menus and track meal preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {properties.length > 1 && (
            <Select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              options={properties.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="Select property"
            />
          )}
          <Button onClick={openModal} disabled={!selectedPropertyId}>
            <Plus className="w-4 h-4 mr-2" /> Update Menu
          </Button>
        </div>
      </div>

      {/* Error banner */}
      {(mealsApi.error || mutationApi.error) && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{mealsApi.error || mutationApi.error}</span>
        </div>
      )}

      {/* Today's Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <Coffee className="w-5 h-5 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-bold">
              {optCount(todayBreakfast)}/{expCount(todayBreakfast)}
            </p>
            <p className="text-xs text-gray-500">Breakfast</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Sun className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-lg font-bold">
              {optCount(todayLunch)}/{expCount(todayLunch)}
            </p>
            <p className="text-xs text-gray-500">Lunch</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Moon className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
            <p className="text-lg font-bold">
              {optCount(todayDinner)}/{expCount(todayDinner)}
            </p>
            <p className="text-xs text-gray-500">Dinner</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-lg font-bold">{avgRating}</p>
            <p className="text-xs text-gray-500">Avg Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <span className="text-lg">🥬</span>
            <p className="text-lg font-bold text-green-600">
              {todayMeals.reduce((n, m) => n + (m._count?.optIns ?? 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Opt-ins Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <UtensilsCrossed className="w-5 h-5 mx-auto text-indigo-500 mb-1" />
            <p className="text-lg font-bold">{meals.length}</p>
            <p className="text-xs text-gray-500">Meals This Week</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5" /> Weekly Menu — {weekLabel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mealsApi.loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-semibold text-gray-500 w-16">Day</th>
                    <th className="text-left p-2 font-semibold text-orange-600">
                      <span className="flex items-center gap-1">
                        <Coffee className="w-3.5 h-3.5" /> Breakfast
                      </span>
                    </th>
                    <th className="text-left p-2 font-semibold text-yellow-600">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5" /> Lunch
                      </span>
                    </th>
                    <th className="text-left p-2 font-semibold text-indigo-600">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5" /> Dinner
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map((day, i) => {
                    const dayMeals = getMealsForDay(i);
                    const isToday = i === todayIndex;
                    return (
                      <tr key={day} className={`border-b last:border-0 ${isToday ? "bg-indigo-50" : ""}`}>
                        <td className="p-2 font-semibold text-gray-900">
                          {day}
                          {isToday && (
                            <Badge variant="info" className="ml-1 text-[10px]">
                              Today
                            </Badge>
                          )}
                        </td>
                        <td className="p-2 text-gray-600">{dayMeals.breakfast}</td>
                        <td className="p-2 text-gray-600">{dayMeals.lunch}</td>
                        <td className="p-2 text-gray-600">{dayMeals.dinner}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Menu Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>
          <ModalTitle>Update Menu</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {mutationApi.error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mutationApi.error}</span>
              </div>
            )}
            <Select
              label="Day"
              value={selectedDay}
              onChange={(e) => handleDayChange(e.target.value)}
              options={weekDays.map((d) => ({
                value: d,
                label: fullDayNames[d],
              }))}
            />
            <Textarea
              label="Breakfast"
              placeholder="Idli, Sambar, Chutney, Chai"
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
            />
            <Textarea
              label="Lunch"
              placeholder="Rice, Dal, Sabzi, Roti, Curd"
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
            />
            <Textarea
              label="Dinner"
              placeholder="Chapati, Paneer, Rice"
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowModal(false)} disabled={mutationApi.loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={mutationApi.loading}>
            {mutationApi.loading ? <Spinner size="sm" className="mr-2" /> : null}
            Save Menu
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
