"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, Sun, Moon } from "lucide-react";

const weekMenu = [
  { day: "Mon", date: "Mar 30", breakfast: "Idli, Sambar, Chutney", lunch: "Rice, Dal, Sabzi, Roti", dinner: "Chapati, Paneer Masala", isToday: false },
  { day: "Tue", date: "Mar 31", breakfast: "Poha, Chai, Eggs", lunch: "Rice, Rajma, Aloo Gobi", dinner: "Dosa, Sambar", isToday: true },
  { day: "Wed", date: "Apr 1", breakfast: "Upma, Vada, Coffee", lunch: "Biryani, Raita", dinner: "Roti, Mix Veg, Dal", isToday: false },
  { day: "Thu", date: "Apr 2", breakfast: "Paratha, Curd", lunch: "Rice, Chole, Jeera Aloo", dinner: "Pulao, Paneer Tikka", isToday: false },
  { day: "Fri", date: "Apr 3", breakfast: "Bread, Omelette", lunch: "Rice, Fish/Dal, Sabzi", dinner: "Chapati, Egg/Aloo Matar", isToday: false },
  { day: "Sat", date: "Apr 4", breakfast: "Puri, Aloo Sabzi", lunch: "Kadhi Pakoda, Bhindi", dinner: "Fried Rice, Manchurian", isToday: false },
  { day: "Sun", date: "Apr 5", breakfast: "Chole Bhature", lunch: "Special Biryani, Sweet", dinner: "Naan, Butter Chicken/Paneer", isToday: false },
];

export default function GuestMealsPage() {
  const [optOuts, setOptOuts] = useState<Record<string, string[]>>({});

  const toggleOptOut = (day: string, meal: string) => {
    setOptOuts(prev => {
      const dayOuts = prev[day] || [];
      return { ...prev, [day]: dayOuts.includes(meal) ? dayOuts.filter(m => m !== meal) : [...dayOuts, meal] };
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meal Menu</h1>
        <p className="text-sm text-gray-500 mt-1">This week&apos;s menu. Tap a meal to opt-out.</p>
      </div>

      <div className="space-y-3">
        {weekMenu.map((day) => (
          <Card key={day.day} className={day.isToday ? "border-indigo-300 bg-indigo-50/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-gray-900">{day.day}</span>
                <span className="text-sm text-gray-500">{day.date}</span>
                {day.isToday && <Badge variant="info">Today</Badge>}
              </div>
              <div className="space-y-2">
                {[
                  { key: "breakfast", icon: <Coffee className="w-4 h-4 text-orange-500" />, label: "Breakfast", menu: day.breakfast },
                  { key: "lunch", icon: <Sun className="w-4 h-4 text-yellow-500" />, label: "Lunch", menu: day.lunch },
                  { key: "dinner", icon: <Moon className="w-4 h-4 text-indigo-500" />, label: "Dinner", menu: day.dinner },
                ].map((meal) => {
                  const isOptedOut = (optOuts[day.day] || []).includes(meal.key);
                  return (
                    <div key={meal.key} className={`flex items-center justify-between p-2 rounded-lg ${isOptedOut ? "bg-gray-100 opacity-60" : "bg-white"}`}>
                      <div className="flex items-center gap-3">
                        {meal.icon}
                        <div>
                          <p className="text-xs font-semibold text-gray-500">{meal.label}</p>
                          <p className={`text-sm ${isOptedOut ? "line-through text-gray-400" : "text-gray-700"}`}>{meal.menu}</p>
                        </div>
                      </div>
                      <Button variant={isOptedOut ? "outline" : "ghost"} size="sm" onClick={() => toggleOptOut(day.day, meal.key)}>
                        {isOptedOut ? "Opt In" : "Opt Out"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
