"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Wifi, Car, Dumbbell, Wind, UtensilsCrossed, Shield, Heart } from "lucide-react";

const mockPGs = [
  { id: "1", name: "Sunshine PG for Men", address: "Koramangala 4th Block, Bangalore", genderType: "MALE", minRent: 6500, maxRent: 13000, rating: 4.2, reviews: 48, amenities: ["WiFi", "AC", "Food", "Parking", "CCTV"], distance: "1.2 km", occupancy: 87, photos: 12, featured: true },
  { id: "2", name: "Green Valley Women's Hostel", address: "Madhapur, Hi-Tech City, Hyderabad", genderType: "FEMALE", minRent: 7000, maxRent: 15000, rating: 4.5, reviews: 72, amenities: ["WiFi", "AC", "Food", "Gym", "Laundry", "CCTV"], distance: "0.8 km", occupancy: 89, photos: 18, featured: true },
  { id: "3", name: "Urban Nest Co-Living", address: "HSR Layout Sector 2, Bangalore", genderType: "COED", minRent: 8000, maxRent: 16000, rating: 3.8, reviews: 31, amenities: ["WiFi", "AC", "Gym", "Parking"], distance: "2.5 km", occupancy: 72, photos: 8, featured: false },
  { id: "4", name: "Comfort Stay PG", address: "Whitefield Main Road, Bangalore", genderType: "MALE", minRent: 5000, maxRent: 10000, rating: 4.0, reviews: 22, amenities: ["WiFi", "Food", "CCTV"], distance: "4.1 km", occupancy: 75, photos: 6, featured: false },
  { id: "5", name: "Pearl Women's PG", address: "Indiranagar, Bangalore", genderType: "FEMALE", minRent: 9000, maxRent: 18000, rating: 4.6, reviews: 95, amenities: ["WiFi", "AC", "Food", "Gym", "Laundry", "CCTV", "Parking"], distance: "1.8 km", occupancy: 95, photos: 22, featured: true },
  { id: "6", name: "StudyNest Hostel", address: "Ameerpet, Hyderabad", genderType: "COED", minRent: 4500, maxRent: 8000, rating: 3.5, reviews: 15, amenities: ["WiFi", "Food"], distance: "3.2 km", occupancy: 60, photos: 4, featured: false },
];

const amenityIcon: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Parking: <Car className="w-3 h-3" />,
  Gym: <Dumbbell className="w-3 h-3" />,
  AC: <Wind className="w-3 h-3" />,
  Food: <UtensilsCrossed className="w-3 h-3" />,
  CCTV: <Shield className="w-3 h-3" />,
};

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [budget, setBudget] = useState("");
  const [savedPGs, setSavedPGs] = useState<string[]>([]);

  const filtered = mockPGs.filter((pg) => {
    if (search && !pg.name.toLowerCase().includes(search.toLowerCase()) && !pg.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (gender && pg.genderType !== gender) return false;
    if (budget === "5000" && pg.minRent > 5000) return false;
    if (budget === "10000" && pg.minRent > 10000) return false;
    if (budget === "15000" && pg.minRent > 15000) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Explore PGs</h1>
        <p className="text-sm text-gray-500 mt-1">Find your perfect PG or hostel</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Search by area, name, or city..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} />
        </div>
        <Select label="" value={gender} onChange={(e) => setGender(e.target.value)} options={[{ value: "", label: "All Genders" }, { value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "COED", label: "Co-Ed" }]} />
        <Select label="" value={budget} onChange={(e) => setBudget(e.target.value)} options={[{ value: "", label: "Any Budget" }, { value: "5000", label: "Under ₹5K" }, { value: "10000", label: "Under ₹10K" }, { value: "15000", label: "Under ₹15K" }]} />
      </div>

      <p className="text-sm text-gray-500">{filtered.length} PGs found</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((pg) => (
          <Card key={pg.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-0">
              <div className="h-44 bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 relative">
                {pg.featured && <Badge className="absolute top-2 left-2" variant="warning">Featured</Badge>}
                <button
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
                  onClick={(e) => { e.stopPropagation(); setSavedPGs(prev => prev.includes(pg.id) ? prev.filter(id => id !== pg.id) : [...prev, pg.id]); }}
                >
                  <Heart className={`w-4 h-4 ${savedPGs.includes(pg.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">{pg.photos} photos</div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{pg.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {pg.address}
                    </p>
                  </div>
                  <Badge variant={pg.genderType === "MALE" ? "info" : pg.genderType === "FEMALE" ? "warning" : "default"}>{pg.genderType}</Badge>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 font-medium"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {pg.rating}</span>
                  <span className="text-gray-400">({pg.reviews} reviews)</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500">{pg.distance}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pg.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {amenityIcon[a] || null} {a}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <span className="text-lg font-bold text-indigo-600">₹{(pg.minRent / 1000).toFixed(1)}K</span>
                    <span className="text-gray-400 text-sm"> – ₹{(pg.maxRent / 1000).toFixed(0)}K/mo</span>
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
