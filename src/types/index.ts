// ─── Enums ───────────────────────────────────────────────────────────────────

export enum UserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  GUEST = "GUEST",
  STAFF = "STAFF",
}

export enum GenderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  COED = "COED",
}

export enum RoomType {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  TRIPLE = "TRIPLE",
  DORM = "DORM",
}

export enum RoomStatus {
  VACANT = "VACANT",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PaymentType {
  RENT = "RENT",
  DEPOSIT = "DEPOSIT",
  ADVANCE = "ADVANCE",
  PENALTY = "PENALTY",
  REFUND = "REFUND",
}

export enum PaymentMethod {
  UPI = "UPI",
  CARD = "CARD",
  NETBANKING = "NETBANKING",
  CASH = "CASH",
  WALLET = "WALLET",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum ComplaintCategory {
  PLUMBING = "PLUMBING",
  ELECTRICAL = "ELECTRICAL",
  CLEANING = "CLEANING",
  PEST = "PEST",
  NOISE = "NOISE",
  FOOD = "FOOD",
  OTHER = "OTHER",
}

export enum ComplaintPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum ComplaintStatus {
  OPEN = "OPEN",
  ASSIGNED = "ASSIGNED",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}

export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
}

export enum VisitorStatus {
  EXPECTED = "EXPECTED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  DENIED = "DENIED",
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string | null;
  languagePreference: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  genderType: GenderType;
  amenities: string[];
  rules: string[];
  photos: string[];
  isListed: boolean;
  isActive: boolean;
  avgRating: number | null;
}

export interface Room {
  id: string;
  propertyId: string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  sharingType: number;
  monthlyRent: number;
  dailyRent: number | null;
  status: RoomStatus;
  totalBeds: number;
  occupiedBeds: number;
  amenities: string[];
}

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  bedNumber: number | null;
  checkInDate: Date;
  checkOutDate: Date | null;
  status: BookingStatus;
  bookingAmount: number;
  securityDeposit: number;
  rentAmount: number;
  paymentStatus: PaymentStatus;
  agreementUrl: string | null;
  noticePeriodEnd: Date | null;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  method: PaymentMethod;
  status: PaymentStatus;
  gatewayTxnId: string | null;
  invoiceUrl: string | null;
  dueDate: Date;
  paidAt: Date | null;
}

export interface Complaint {
  id: string;
  guestId: string;
  propertyId: string;
  roomId: string | null;
  category: ComplaintCategory;
  title: string;
  description: string;
  photos: string[];
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedTo: string | null;
  resolvedAt: Date | null;
  satisfactionRating: number | null;
}

export interface Meal {
  id: string;
  propertyId: string;
  date: Date;
  mealType: MealType;
  menuItems: string[];
  guestOptIns: string[];
  expectedCount: number;
  actualCount: number | null;
  feedbackAvgRating: number | null;
}

export interface Visitor {
  id: string;
  guestId: string;
  propertyId: string;
  visitorName: string;
  visitorPhone: string;
  visitorIdProof: string | null;
  purpose: string;
  entryTime: Date | null;
  exitTime: Date | null;
  approvedBy: string | null;
  status: VisitorStatus;
}

// ─── Utility Types ───────────────────────────────────────────────────────────

export interface DashboardStats {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  occupancyRate: number;
  totalGuests: number;
  activeBookings: number;
  pendingComplaints: number;
  monthlyRevenue: number;
  pendingPayments: number;
  upcomingCheckIns: number;
  upcomingCheckOuts: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
