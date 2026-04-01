export const APP_NAME = "PG Manager";
export const APP_DESCRIPTION = "Modern PG/Hostel Management Platform";

// ─── Pagination ──────────────────────────────────────────────────────────────

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ─── Amenities ───────────────────────────────────────────────────────────────

export const AMENITIES = [
  "Wi-Fi",
  "AC",
  "Geyser",
  "TV",
  "Fridge",
  "Washing Machine",
  "Power Backup",
  "Water Purifier",
  "CCTV",
  "Parking",
  "Gym",
  "Library",
  "Common Area",
  "Rooftop Access",
  "Kitchen Access",
  "Housekeeping",
  "Laundry Service",
  "Meal Service",
  "Security Guard",
  "Lift",
  "Intercom",
  "Fire Extinguisher",
  "First Aid Kit",
] as const;

// ─── Complaint Categories ────────────────────────────────────────────────────

export const COMPLAINT_CATEGORIES = [
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "CLEANING", label: "Cleaning" },
  { value: "PEST", label: "Pest Control" },
  { value: "NOISE", label: "Noise" },
  { value: "FOOD", label: "Food" },
  { value: "OTHER", label: "Other" },
] as const;

// ─── Room Types ──────────────────────────────────────────────────────────────

export const ROOM_TYPES = [
  { value: "SINGLE", label: "Single", sharing: 1 },
  { value: "DOUBLE", label: "Double", sharing: 2 },
  { value: "TRIPLE", label: "Triple", sharing: 3 },
  { value: "DORM", label: "Dormitory", sharing: 6 },
] as const;

// ─── Gender Types ────────────────────────────────────────────────────────────

export const GENDER_TYPES = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "COED", label: "Co-ed" },
] as const;

// ─── Indian Cities ───────────────────────────────────────────────────────────

export const INDIAN_CITIES = [
  "Ahmedabad",
  "Bangalore",
  "Bhopal",
  "Bhubaneswar",
  "Chandigarh",
  "Chennai",
  "Coimbatore",
  "Dehradun",
  "Delhi",
  "Faridabad",
  "Ghaziabad",
  "Goa",
  "Gurugram",
  "Guwahati",
  "Hyderabad",
  "Indore",
  "Jaipur",
  "Kanpur",
  "Kochi",
  "Kolkata",
  "Lucknow",
  "Ludhiana",
  "Mangalore",
  "Mumbai",
  "Mysore",
  "Nagpur",
  "Nashik",
  "Navi Mumbai",
  "Noida",
  "Patna",
  "Pune",
  "Rajkot",
  "Ranchi",
  "Surat",
  "Thane",
  "Thiruvananthapuram",
  "Vadodara",
  "Varanasi",
  "Vijayawada",
  "Visakhapatnam",
] as const;

// ─── Indian States ───────────────────────────────────────────────────────────

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
] as const;

// ─── Meal Types ──────────────────────────────────────────────────────────────

export const MEAL_TYPES = [
  { value: "BREAKFAST", label: "Breakfast", time: "07:30 - 09:30" },
  { value: "LUNCH", label: "Lunch", time: "12:30 - 14:00" },
  { value: "DINNER", label: "Dinner", time: "19:30 - 21:30" },
] as const;

// ─── Payment Methods ─────────────────────────────────────────────────────────

export const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "CARD", label: "Credit / Debit Card" },
  { value: "NETBANKING", label: "Net Banking" },
  { value: "CASH", label: "Cash" },
  { value: "WALLET", label: "Wallet" },
] as const;

// ─── Priority Levels ─────────────────────────────────────────────────────────

export const PRIORITY_LEVELS = [
  { value: "LOW", label: "Low", color: "bg-blue-100 text-blue-700" },
  { value: "MEDIUM", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-700" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-700" },
] as const;
