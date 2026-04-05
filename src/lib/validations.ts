import { z } from "zod";

// ─── Shared ─────────────────────────────────────────────────────────────────

const uuid = z.string().uuid();
const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};

// ─── Property ───────────────────────────────────────────────────────────────

export const createPropertySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  genderType: z.enum(["MALE", "FEMALE", "COED"]),
  amenities: z.any().optional(),
  rules: z.any().optional(),
  photos: z.any().optional(),
});

export const updatePropertySchema = createPropertySchema.partial();

// ─── Room ───────────────────────────────────────────────────────────────────

export const createRoomSchema = z.object({
  propertyId: uuid,
  roomNumber: z.string().min(1).max(20),
  floor: z.number().int().min(0).max(100),
  roomType: z.enum(["SINGLE", "DOUBLE", "TRIPLE", "DORM"]),
  sharingType: z.number().int().min(1).max(20),
  monthlyRent: z.number().positive(),
  dailyRent: z.number().positive().optional(),
  status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]).optional(),
  totalBeds: z.number().int().min(1).max(20),
  amenities: z.any().optional(),
});

export const updateRoomSchema = createRoomSchema.omit({ propertyId: true }).partial();

// ─── Booking ────────────────────────────────────────────────────────────────

export const createBookingSchema = z.object({
  guestId: uuid,
  roomId: uuid,
  bedNumber: z.number().int().min(1).optional(),
  checkInDate: z.string().datetime({ offset: true }).or(z.string().date()),
  checkOutDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  bookingAmount: z.number().nonnegative(),
  securityDeposit: z.number().nonnegative(),
  rentAmount: z.number().positive(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  checkOutDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
  bedNumber: z.number().int().min(1).optional(),
  agreementUrl: z.string().url().optional(),
});

// ─── Payment ────────────────────────────────────────────────────────────────

export const createPaymentSchema = z.object({
  bookingId: uuid,
  amount: z.number().positive(),
  currency: z.string().length(3).default("INR"),
  type: z.enum(["RENT", "DEPOSIT", "ADVANCE", "PENALTY", "REFUND"]),
  method: z.enum(["UPI", "CARD", "NETBANKING", "CASH", "WALLET"]),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()),
  gatewayTxnId: z.string().optional(),
  invoiceUrl: z.string().url().optional(),
});

export const updatePaymentSchema = z.object({
  status: z.enum(["P_PENDING", "SUCCESS", "FAILED", "REFUNDED"]).optional(),
  paidAt: z.string().datetime({ offset: true }).optional(),
  gatewayTxnId: z.string().optional(),
  method: z.enum(["UPI", "CARD", "NETBANKING", "CASH", "WALLET"]).optional(),
});

// ─── Complaint ──────────────────────────────────────────────────────────────

export const createComplaintSchema = z.object({
  propertyId: uuid,
  roomId: uuid.optional(),
  category: z.enum(["PLUMBING", "ELECTRICAL", "CLEANING", "PEST", "NOISE", "FOOD", "OTHER"]),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  photos: z.any().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assignedTo: uuid.optional(),
  satisfactionRating: z.number().int().min(1).max(5).optional(),
});

// ─── Meal ───────────────────────────────────────────────────────────────────

export const createMealSchema = z.object({
  propertyId: uuid,
  date: z.string().datetime({ offset: true }).or(z.string().date()),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER"]),
  menuItems: z.any(),
  expectedCount: z.number().int().nonnegative().optional(),
});

export const updateMealSchema = z.object({
  menuItems: z.any().optional(),
  expectedCount: z.number().int().nonnegative().optional(),
  actualCount: z.number().int().nonnegative().optional(),
});

// ─── Visitor ────────────────────────────────────────────────────────────────

export const createVisitorSchema = z.object({
  propertyId: uuid,
  visitorName: z.string().min(1).max(100),
  visitorPhone: z.string().min(7).max(15),
  visitorIdProof: z.string().optional(),
  purpose: z.string().min(1).max(500),
  entryTime: z.string().datetime({ offset: true }).optional(),
});

export const updateVisitorSchema = z.object({
  status: z.enum(["EXPECTED", "CHECKED_IN", "CHECKED_OUT", "DENIED"]).optional(),
  entryTime: z.string().datetime({ offset: true }).optional(),
  exitTime: z.string().datetime({ offset: true }).optional(),
  approvedBy: uuid.optional(),
});

// ─── Review ─────────────────────────────────────────────────────────────────

export const createReviewSchema = z.object({
  propertyId: uuid,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
  isPublic: z.boolean().optional(),
});

// ─── Announcement ───────────────────────────────────────────────────────────

export const createAnnouncementSchema = z.object({
  propertyId: uuid,
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  type: z.enum(["GENERAL", "MAINTENANCE", "EMERGENCY", "EVENT"]).optional(),
  isPinned: z.boolean().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema
  .omit({ propertyId: true })
  .partial()
  .extend({ isActive: z.boolean().optional() });

// ─── Expense ────────────────────────────────────────────────────────────────

export const createExpenseSchema = z.object({
  propertyId: uuid,
  category: z.enum(["MAINTENANCE", "GROCERIES", "UTILITIES", "STAFF_SALARY", "SUPPLIES", "OTHER"]),
  amount: z.number().positive(),
  description: z.string().max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  date: z.string().datetime({ offset: true }).or(z.string().date()),
});

export const updateExpenseSchema = createExpenseSchema.omit({ propertyId: true }).partial();

// ─── Task ───────────────────────────────────────────────────────────────────

export const createTaskSchema = z.object({
  propertyId: uuid,
  assignedTo: uuid,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
});

// ─── Notice Period ──────────────────────────────────────────────────────────

export const createNoticePeriodSchema = z.object({
  bookingId: uuid,
  noticeDays: z.number().int().min(1).max(90).optional(),
  expectedEndDate: z.string().datetime({ offset: true }).or(z.string().date()),
  reason: z.string().max(1000).optional(),
});

export const updateNoticePeriodSchema = z.object({
  status: z.enum(["REQUESTED", "APPROVED", "COMPLETED", "WITHDRAWN"]).optional(),
  reason: z.string().max(1000).optional(),
});

// ─── Notification ───────────────────────────────────────────────────────────

export const createNotificationSchema = z.object({
  userId: uuid,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(2000),
  type: z.string().min(1).max(50),
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse and validate request body with a Zod schema.
 * Returns { data } on success or { error } on failure.
 */
export function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue.path.join(".");
    const message = path ? `${path}: ${firstIssue.message}` : firstIssue.message;
    return { data: null, error: message };
  }
  return { data: result.data, error: null };
}

export { paginationQuery };
