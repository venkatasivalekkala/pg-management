import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@pgmanager.com" },
    update: {},
    create: {
      name: "Aadya Sharma",
      email: "owner@pgmanager.com",
      phone: "9876543210",
      role: "OWNER",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✓ Owner created:", owner.name);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@pgmanager.com" },
    update: {},
    create: {
      name: "Rajesh Kumar",
      email: "admin@pgmanager.com",
      phone: "9876543211",
      role: "ADMIN",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✓ Admin created:", admin.name);

  // Create Guests
  const guestData = [
    { name: "Rahul Sharma", email: "rahul@example.com", phone: "9876543212" },
    { name: "Priya Patel", email: "priya@example.com", phone: "9876543213" },
    { name: "Amit Kumar", email: "amit@example.com", phone: "9876543214" },
    { name: "Sneha Reddy", email: "sneha@example.com", phone: "9876543215" },
    { name: "Vikram Singh", email: "vikram@example.com", phone: "9876543216" },
    { name: "Meera Tiwari", email: "meera@example.com", phone: "9876543217" },
  ];

  const guests = [];
  for (const g of guestData) {
    const guest = await prisma.user.upsert({
      where: { email: g.email },
      update: {},
      create: { ...g, role: "GUEST", isVerified: true, isActive: true },
    });
    guests.push(guest);
  }
  console.log(`✓ ${guests.length} guests created`);

  // Create Staff
  const staff = await prisma.user.upsert({
    where: { email: "raju@example.com" },
    update: {},
    create: {
      name: "Raju Kumar",
      email: "raju@example.com",
      phone: "9800000001",
      role: "STAFF",
      isVerified: true,
      isActive: true,
    },
  });
  console.log("✓ Staff created:", staff.name);

  // Create Property
  const property = await prisma.property.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      ownerId: owner.id,
      name: "Sunshine PG for Men",
      description: "Modern PG accommodation in the heart of Koramangala with all amenities.",
      address: "4th Block, Koramangala",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
      latitude: 12.9352,
      longitude: 77.6245,
      genderType: "MALE",
      amenities: ["WiFi", "AC", "Food", "Parking", "CCTV", "Laundry", "Gym"],
      rules: ["Curfew at 10:30 PM", "No smoking", "Visitors until 8 PM"],
      photos: [],
      isListed: true,
      isActive: true,
      avgRating: 4.2,
    },
  });
  console.log("✓ Property created:", property.name);

  // Assign admin to property
  await prisma.propertyAdmin.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      propertyId: property.id,
      userId: admin.id,
    },
  });

  // Create Rooms
  const roomsData = [
    { roomNumber: "A-101", floor: 1, roomType: "DOUBLE" as const, sharingType: 2, monthlyRent: 8000, totalBeds: 2, status: "OCCUPIED" as const, occupiedBeds: 2 },
    { roomNumber: "A-102", floor: 1, roomType: "TRIPLE" as const, sharingType: 3, monthlyRent: 6500, totalBeds: 3, status: "OCCUPIED" as const, occupiedBeds: 2 },
    { roomNumber: "A-103", floor: 1, roomType: "SINGLE" as const, sharingType: 1, monthlyRent: 12000, totalBeds: 1, status: "VACANT" as const, occupiedBeds: 0 },
    { roomNumber: "A-104", floor: 1, roomType: "DOUBLE" as const, sharingType: 2, monthlyRent: 8000, totalBeds: 2, status: "MAINTENANCE" as const, occupiedBeds: 0 },
    { roomNumber: "B-201", floor: 2, roomType: "SINGLE" as const, sharingType: 1, monthlyRent: 12000, totalBeds: 1, status: "OCCUPIED" as const, occupiedBeds: 1 },
    { roomNumber: "B-202", floor: 2, roomType: "TRIPLE" as const, sharingType: 3, monthlyRent: 6500, totalBeds: 3, status: "OCCUPIED" as const, occupiedBeds: 3 },
    { roomNumber: "B-203", floor: 2, roomType: "DOUBLE" as const, sharingType: 2, monthlyRent: 8000, totalBeds: 2, status: "VACANT" as const, occupiedBeds: 0 },
    { roomNumber: "C-301", floor: 3, roomType: "SINGLE" as const, sharingType: 1, monthlyRent: 13000, totalBeds: 1, status: "OCCUPIED" as const, occupiedBeds: 1 },
  ];

  const rooms = [];
  for (const r of roomsData) {
    const room = await prisma.room.create({
      data: { propertyId: property.id, ...r, dailyRent: Math.round(r.monthlyRent / 30), amenities: ["Bed", "Fan", "Light", "Wardrobe"] },
    });
    rooms.push(room);
  }
  console.log(`✓ ${rooms.length} rooms created`);

  // Create Bookings
  const bookings = [];
  const bookingPairs = [
    { guest: 0, room: 0 },
    { guest: 1, room: 1 },
    { guest: 2, room: 4 },
    { guest: 3, room: 5 },
    { guest: 4, room: 7 },
  ];

  for (const bp of bookingPairs) {
    const booking = await prisma.booking.create({
      data: {
        guestId: guests[bp.guest].id,
        roomId: rooms[bp.room].id,
        bedNumber: 1,
        checkInDate: new Date("2026-01-15"),
        status: "CONFIRMED",
        bookingAmount: rooms[bp.room].monthlyRent,
        securityDeposit: rooms[bp.room].monthlyRent * 2,
        rentAmount: rooms[bp.room].monthlyRent,
        paymentStatus: "PAID",
      },
    });
    bookings.push(booking);
  }
  console.log(`✓ ${bookings.length} bookings created`);

  // Create Payments
  for (const booking of bookings) {
    for (const month of ["2026-02-01", "2026-03-01"]) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.rentAmount,
          type: "RENT",
          method: "UPI",
          status: "SUCCESS",
          dueDate: new Date(month),
          paidAt: new Date(month),
        },
      });
    }
  }
  console.log("✓ Payment records created");

  // Create Complaints
  await prisma.complaint.createMany({
    data: [
      { guestId: guests[0].id, propertyId: property.id, roomId: rooms[0].id, category: "PLUMBING", title: "Water leakage in bathroom", description: "Water is leaking from shower pipe.", photos: [], priority: "HIGH", status: "OPEN" },
      { guestId: guests[1].id, propertyId: property.id, roomId: rooms[1].id, category: "ELECTRICAL", title: "AC not cooling", description: "AC runs but room stays hot.", photos: [], priority: "MEDIUM", status: "ASSIGNED", assignedTo: staff.id },
      { guestId: guests[2].id, propertyId: property.id, roomId: rooms[4].id, category: "CLEANING", title: "Room not cleaned", description: "Room not cleaned for 3 days.", photos: [], priority: "LOW", status: "RESOLVED", assignedTo: staff.id, resolvedAt: new Date() },
    ],
  });
  console.log("✓ Complaints created");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Login credentials:");
  console.log("   Owner:  phone 9876543210");
  console.log("   Admin:  phone 9876543211");
  console.log("   Guest:  phone 9876543212");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
