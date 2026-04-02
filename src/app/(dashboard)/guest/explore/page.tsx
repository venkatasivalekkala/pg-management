"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Dumbbell,
  Wind,
  UtensilsCrossed,
  Shield,
  Heart,
  Search,
  Building2,
  Users,
  X,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  city?: string;
  area?: string;
  genderType: string;
  minRent: number;
  maxRent: number;
  rating?: number;
  reviews?: number;
  amenities: string[];
  distance?: string;
  occupancy?: number;
  photos?: number;
  featured?: boolean;
  description?: string;
  rules?: string[];
  availableRooms?: number;
  imageUrl?: string;
}

const amenityIcon: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-3 h-3" />,
  Parking: <Car className="w-3 h-3" />,
  Gym: <Dumbbell className="w-3 h-3" />,
  AC: <Wind className="w-3 h-3" />,
  Food: <UtensilsCrossed className="w-3 h-3" />,
  CCTV: <Shield className="w-3 h-3" />,
};

export default function ExplorePage() {
  const api = useApi();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [budget, setBudget] = useState("");
  const [savedPGs, setSavedPGs] = useState<string[]>([]);
  const [selectedPG, setSelectedPG] = useState<Property | null>(null);

  useEffect(() => {
    async function load() {
      const data = await api.get("/api/properties?isListed=true");
      if (data) {
        const list = Array.isArray(data) ? data : data.data || [];
        setProperties(list);
      }
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loaded || api.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (api.error) {
    return (
      <EmptyState
        icon={<Building2 className="w-6 h-6" />}
        title="Failed to load properties"
        description={api.error}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  const filtered = properties.filter((pg) => {
    if (
      search &&
      !pg.name.toLowerCase().includes(search.toLowerCase()) &&
      !pg.address.toLowerCase().includes(search.toLowerCase()) &&
      !(pg.city || "").toLowerCase().includes(search.toLowerCase()) &&
      !(pg.area || "").toLowerCase().includes(search.toLowerCase())
    )
      return false;
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by area, name, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
        </div>
        <Select
          label=""
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          options={[
            { value: "", label: "All Genders" },
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
            { value: "COED", label: "Co-Ed" },
          ]}
        />
        <Select
          label=""
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          options={[
            { value: "", label: "Any Budget" },
            { value: "5000", label: "Under \u20B95K" },
            { value: "10000", label: "Under \u20B910K" },
            { value: "15000", label: "Under \u20B915K" },
          ]}
        />
      </div>

      <p className="text-sm text-gray-500">{filtered.length} PGs found</p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="w-6 h-6" />}
          title="No PGs found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((pg) => (
            <Card
              key={pg.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPG(pg)}
            >
              <CardContent className="p-0">
                <div className="h-44 bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 relative">
                  {pg.featured && (
                    <Badge className="absolute top-2 left-2" variant="warning">
                      Featured
                    </Badge>
                  )}
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedPGs((prev) =>
                        prev.includes(pg.id)
                          ? prev.filter((id) => id !== pg.id)
                          : [...prev, pg.id]
                      );
                    }}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        savedPGs.includes(pg.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    {pg.photos || 0} photos
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{pg.name}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {pg.address}
                      </p>
                    </div>
                    <Badge
                      variant={
                        pg.genderType === "MALE"
                          ? "info"
                          : pg.genderType === "FEMALE"
                          ? "warning"
                          : "default"
                      }
                    >
                      {pg.genderType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    {pg.rating != null && (
                      <>
                        <span className="flex items-center gap-1 font-medium">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {pg.rating}
                        </span>
                        <span className="text-gray-400">({pg.reviews || 0} reviews)</span>
                      </>
                    )}
                    {pg.distance && (
                      <>
                        <span className="text-gray-400">&middot;</span>
                        <span className="text-gray-500">{pg.distance}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {pg.amenities?.map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {amenityIcon[a] || null} {a}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div>
                      <span className="text-lg font-bold text-indigo-600">
                        {"\u20B9"}{(pg.minRent / 1000).toFixed(1)}K
                      </span>
                      <span className="text-gray-400 text-sm">
                        {" "}&ndash; {"\u20B9"}{(pg.maxRent / 1000).toFixed(0)}K/mo
                      </span>
                    </div>
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); setSelectedPG(pg); }}>
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!selectedPG} onClose={() => setSelectedPG(null)}>
        {selectedPG && (
          <>
            <ModalHeader onClose={() => setSelectedPG(null)}>
              <ModalTitle>{selectedPG.name}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" /> {selectedPG.address}
                </div>

                {selectedPG.description && (
                  <p className="text-sm text-gray-700">{selectedPG.description}</p>
                )}

                <div className="flex items-center gap-3 text-sm">
                  <Badge
                    variant={
                      selectedPG.genderType === "MALE"
                        ? "info"
                        : selectedPG.genderType === "FEMALE"
                        ? "warning"
                        : "default"
                    }
                  >
                    {selectedPG.genderType}
                  </Badge>
                  {selectedPG.rating != null && (
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />{" "}
                      {selectedPG.rating} ({selectedPG.reviews || 0} reviews)
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Price Range</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {"\u20B9"}{selectedPG.minRent.toLocaleString()} &ndash; {"\u20B9"}{selectedPG.maxRent.toLocaleString()}/mo
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPG.amenities?.map((a) => (
                      <span
                        key={a}
                        className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {amenityIcon[a] || null} {a}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedPG.availableRooms != null && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Availability</p>
                    <p className="text-sm text-gray-600">
                      <Users className="w-4 h-4 inline mr-1" />
                      {selectedPG.availableRooms} rooms available
                    </p>
                  </div>
                )}

                {selectedPG.rules && selectedPG.rules.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">House Rules</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedPG.rules.map((rule, i) => (
                        <li key={i}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setSelectedPG(null)}>
                Close
              </Button>
              <Button onClick={() => (window.location.href = `/guest/explore/${selectedPG.id}/book`)}>
                Book Now
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
