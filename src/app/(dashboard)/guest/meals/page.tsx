"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { Coffee, Sun, Moon, UtensilsCrossed } from "lucide-react";

interface MealDay {
  id: string;
  day: string;
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  isToday?: boolean;
  optOuts?: string[];
}

const DIET_OPTIONS = [
  { value: "VEG", label: "Veg" },
  { value: "NON_VEG", label: "Non-Veg" },
  { value: "JAIN", label: "Jain" },
  { value: "VEGAN", label: "Vegan" },
];

export default function GuestMealsPage() {
  const api = useApi();
  const [meals, setMeals] = useState<MealDay[]>([]);
  const [optOuts, setOptOuts] = useState<Record<string, string[]>>({});
  const [dietPreference, setDietPreference] = useState("VEG");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await api.get("/api/meals");
      if (data) {
        const list: MealDay[] = Array.isArray(data) ? data : data.data || [];
        setMeals(list);
        const existingOptOuts: Record<string, string[]> = {};
        list.forEach((m) => {
          if (m.optOuts && m.optOuts.length > 0) {
            existingOptOuts[m.id] = m.optOuts;
          }
        });
        setOptOuts(existingOptOuts);
      }
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleOptOut = async (mealId: string, mealType: string) => {
    const dayOuts = optOuts[mealId] || [];
    const isCurrentlyOptedOut = dayOuts.includes(mealType);
    const newDayOuts = isCurrentlyOptedOut
      ? dayOuts.filter((m) => m !== mealType)
      : [...dayOuts, mealType];

    setOptOuts((prev) => ({ ...prev, [mealId]: newDayOuts }));

    await api.put(`/api/meals/${mealId}`, {
      optOuts: newDayOuts,
      action: isCurrentlyOptedOut ? "OPT_IN" : "OPT_OUT",
      mealType,
    });
  };

  const handleDietChange = async (value: string) => {
    setDietPreference(value);
    await api.put("/api/meals/preference", { dietPreference: value });
  };

  if (!loaded || api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error && meals.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="w-6 h-6" />}
        title="Failed to load meal menu"
        description={api.error}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  if (meals.length === 0) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="w-6 h-6" />}
        title="No meal menu available"
        description="The meal menu has not been published yet."
      />
    );
  }

  const todayMeal = meals.find((m) => m.isToday);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Menu</h1>
          <p className="text-sm text-gray-500 mt-1">
            This week&apos;s menu. Tap a meal to opt out.
          </p>
        </div>
        <div className="w-40">
          <Select
            label="Diet Preference"
            value={dietPreference}
            onChange={(e) => handleDietChange(e.target.value)}
            options={DIET_OPTIONS}
          />
        </div>
      </div>

      {/* Today's Menu Highlight */}
      {todayMeal && (
        <Card className="border-indigo-300 bg-indigo-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
              Today&apos;s Menu &middot; {todayMeal.day}, {todayMeal.date}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: "breakfast", icon: <Coffee className="w-5 h-5 text-orange-500" />, label: "Breakfast", menu: todayMeal.breakfast },
                { key: "lunch", icon: <Sun className="w-5 h-5 text-yellow-500" />, label: "Lunch", menu: todayMeal.lunch },
                { key: "dinner", icon: <Moon className="w-5 h-5 text-indigo-500" />, label: "Dinner", menu: todayMeal.dinner },
              ].map((meal) => {
                const isOptedOut = (optOuts[todayMeal.id] || []).includes(meal.key);
                return (
                  <div
                    key={meal.key}
                    className={`p-3 rounded-lg border ${isOptedOut ? "bg-gray-100 opacity-60 border-gray-200" : "bg-white border-indigo-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {meal.icon}
                      <span className="text-sm font-semibold text-gray-700">{meal.label}</span>
                    </div>
                    <p className={`text-sm ${isOptedOut ? "line-through text-gray-400" : "text-gray-700"}`}>
                      {meal.menu}
                    </p>
                    <Button
                      variant={isOptedOut ? "outline" : "ghost"}
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => toggleOptOut(todayMeal.id, meal.key)}
                    >
                      {isOptedOut ? "Opt In" : "Opt Out"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Menu */}
      <div className="space-y-3">
        {meals.map((day) => {
          if (day.isToday) return null;
          return (
            <Card key={day.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900">{day.day}</span>
                  <span className="text-sm text-gray-500">{day.date}</span>
                </div>
                <div className="space-y-2">
                  {[
                    { key: "breakfast", icon: <Coffee className="w-4 h-4 text-orange-500" />, label: "Breakfast", menu: day.breakfast },
                    { key: "lunch", icon: <Sun className="w-4 h-4 text-yellow-500" />, label: "Lunch", menu: day.lunch },
                    { key: "dinner", icon: <Moon className="w-4 h-4 text-indigo-500" />, label: "Dinner", menu: day.dinner },
                  ].map((meal) => {
                    const isOptedOut = (optOuts[day.id] || []).includes(meal.key);
                    return (
                      <div
                        key={meal.key}
                        className={`flex items-center justify-between p-2 rounded-lg ${isOptedOut ? "bg-gray-100 opacity-60" : "bg-white"}`}
                      >
                        <div className="flex items-center gap-3">
                          {meal.icon}
                          <div>
                            <p className="text-xs font-semibold text-gray-500">{meal.label}</p>
                            <p className={`text-sm ${isOptedOut ? "line-through text-gray-400" : "text-gray-700"}`}>
                              {meal.menu}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={isOptedOut ? "outline" : "ghost"}
                          size="sm"
                          onClick={() => toggleOptOut(day.id, meal.key)}
                        >
                          {isOptedOut ? "Opt In" : "Opt Out"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
