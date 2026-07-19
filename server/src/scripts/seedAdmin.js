const { DynamoDBHelper } = require("../clients/dynamodb.client");
const DynamoDBClient = require("../clients/dynamodb.client");
const config = require("../config/env");
const { ROLES, USER_STATUS } = require("../config/constants");

const USERS_TABLE = config.tables.users;
const HOSTS_TABLE = config.tables.hosts || "PlusOne_HostProfiles";

async function seedAdminAndSampleData() {
  console.log(`🌱 Starting to seed Admin Account and Sample Data into local DynamoDB (${config.aws.dynamodbEndpoint})...`);

  try {
    const now = new Date().toISOString();

    // 1. Seed Master Admin User
    const adminUser = {
      userId: "admin-001",
      firebaseUid: "admin-firebase-uid-001",
      email: "admin@plusone.com",
      phone: "+919999999999",
      displayName: "PlusOnne Master Admin",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      role: ROLES.ADMIN,
      authProvider: "email",
      password: "Admin@123", // Stored for custom admin verification/quick login
      isVerified: true,
      status: USER_STATUS.ACTIVE,
      city: "Mumbai",
      coordinates: { lat: 19.076, lng: 72.8777 },
      preferredLanguages: ["English", "Hindi"],
      trustScore: 100,
      totalBookings: 0,
      totalSpent: 0,
      referralCode: "PLUS-ADMIN01",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    await DynamoDBClient.putItem(USERS_TABLE, adminUser);
    console.log(`✅ Master Admin seeded into ${USERS_TABLE}:`);
    console.log(`   Email: admin@plusone.com | Password: Admin@123 | Role: admin | userId: admin-001`);

    // 2. Seed Sample Users
    const sampleUsers = [
      {
        userId: "user-101",
        firebaseUid: "uid-user-101",
        email: "rahul.verma@example.com",
        phone: "+919876543211",
        displayName: "Rahul Verma",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        role: ROLES.USER,
        authProvider: "google",
        isVerified: true,
        status: USER_STATUS.ACTIVE,
        city: "Mumbai",
        coordinates: { lat: 19.076, lng: 72.8777 },
        preferredLanguages: ["English", "Hindi"],
        trustScore: 85,
        totalBookings: 6,
        totalSpent: 14500,
        referralCode: "PLUS-RAHUL",
        createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        updatedAt: now,
        lastLoginAt: now,
      },
      {
        userId: "user-102",
        firebaseUid: "uid-user-102",
        email: "neha.gupta@example.com",
        phone: "+919876543212",
        displayName: "Neha Gupta",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        role: ROLES.USER,
        authProvider: "phone",
        isVerified: true,
        status: USER_STATUS.ACTIVE,
        city: "Delhi",
        coordinates: { lat: 28.6139, lng: 77.209 },
        preferredLanguages: ["English", "Hindi", "Punjabi"],
        trustScore: 92,
        totalBookings: 12,
        totalSpent: 32000,
        referralCode: "PLUS-NEHA",
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: now,
        lastLoginAt: now,
      },
      {
        userId: "user-103",
        firebaseUid: "uid-user-103",
        email: "vikram.singh@example.com",
        phone: "+919876543213",
        displayName: "Vikram Singh",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        role: ROLES.USER,
        authProvider: "email",
        isVerified: false,
        status: USER_STATUS.SUSPENDED,
        city: "Bangalore",
        coordinates: { lat: 12.9716, lng: 77.5946 },
        preferredLanguages: ["English"],
        trustScore: 60,
        totalBookings: 1,
        totalSpent: 1500,
        referralCode: "PLUS-VIKRAM",
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: now,
        lastLoginAt: now,
      },
    ];

    for (const u of sampleUsers) {
      await DynamoDBClient.putItem(USERS_TABLE, u);
    }
    console.log(`✅ Seeded ${sampleUsers.length} sample regular users.`);

    // 3. Seed Sample Hosts & corresponding User records with HOST role
    const sampleHosts = [
      {
        hostId: "host-201",
        displayName: "Aanya Kapoor",
        avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        city: "Mumbai",
        categories: ["coffee_date", "event_companion"],
        bio: "Fashion stylist and coffee connoisseur based in Bandra. I love exploring hidden cafes, boutique art galleries, and upscale rooftop lounges.",
        isOnline: true,
        rating: 4.9,
        totalReviews: 28,
        totalCompletions: 34,
        totalCancellations: 1,
        responseTimeAvg: 12,
        completionRate: 97,
        languages: ["English", "Hindi", "French"],
        experienceYears: 3,
        kycStatus: "verified",
        kycDocuments: {
          aadhaarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
          panUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
          photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        },
        bankDetails: {
          accountNumber: "XXXXXXXXXX4321",
          ifsc: "HDFC0000123",
          accountHolderName: "Aanya Kapoor",
        },
        hostTrustScore: 96,
        earnings: {
          thisMonth: 28500,
          lastMonth: 42000,
          total: 156000,
          pending: 4500,
        },
        schedule: [
          { dayOfWeek: 5, slots: [{ start: "18:00", end: "22:00" }] },
          { dayOfWeek: 6, slots: [{ start: "13:00", end: "22:00" }] },
          { dayOfWeek: 0, slots: [{ start: "13:00", end: "22:00" }] },
        ],
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
      },
      {
        hostId: "host-202",
        displayName: "Rohan Desai",
        avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
        city: "Delhi",
        categories: ["explorer", "sports_partner"],
        bio: "Fitness trainer & heritage enthusiast. Let's explore Lodhi Art District, play tennis at Siri Fort, or grab healthy brunch around Connaught Place.",
        isOnline: false,
        rating: 4.8,
        totalReviews: 14,
        totalCompletions: 16,
        totalCancellations: 0,
        responseTimeAvg: 18,
        completionRate: 100,
        languages: ["English", "Hindi", "Punjabi"],
        experienceYears: 2,
        kycStatus: "pending",
        kycDocuments: {
          aadhaarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
          panUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
          photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
        },
        bankDetails: {
          accountNumber: "XXXXXXXXXX8890",
          ifsc: "ICIC0000456",
          accountHolderName: "Rohan Desai",
        },
        hostTrustScore: 88,
        earnings: {
          thisMonth: 12000,
          lastMonth: 18000,
          total: 48000,
          pending: 3000,
        },
        schedule: [
          { dayOfWeek: 1, slots: [{ start: "09:00", end: "13:00" }] },
          { dayOfWeek: 3, slots: [{ start: "09:00", end: "13:00" }] },
          { dayOfWeek: 6, slots: [{ start: "09:00", end: "18:00" }] },
        ],
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
      {
        hostId: "host-203",
        displayName: "Priya Nair",
        avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
        city: "Bangalore",
        categories: ["coffee_date", "explorer", "event_companion"],
        bio: "Tech UX designer by day, classical dancer and foodie by weekend. Let's explore Indiranagar breweries, live jazz evenings, and artisanal bakeries.",
        isOnline: true,
        rating: 5.0,
        totalReviews: 8,
        totalCompletions: 9,
        totalCancellations: 0,
        responseTimeAvg: 8,
        completionRate: 100,
        languages: ["English", "Malayalam", "Kannada", "Hindi"],
        experienceYears: 1,
        kycStatus: "pending",
        kycDocuments: {
          aadhaarUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
          panUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80",
          photoUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
        },
        bankDetails: {
          accountNumber: "XXXXXXXXXX6655",
          ifsc: "SBIN0001234",
          accountHolderName: "Priya Nair",
        },
        hostTrustScore: 91,
        earnings: {
          thisMonth: 16000,
          lastMonth: 0,
          total: 16000,
          pending: 4000,
        },
        schedule: [
          { dayOfWeek: 5, slots: [{ start: "18:00", end: "22:00" }] },
          { dayOfWeek: 6, slots: [{ start: "13:00", end: "22:00" }] },
        ],
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    for (const h of sampleHosts) {
      // Create user record for host
      const hostUser = {
        userId: h.hostId,
        firebaseUid: `uid-${h.hostId}`,
        email: `${h.displayName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        phone: "+9198000" + h.hostId.replace(/\D/g, "").padStart(5, "0"),
        displayName: h.displayName,
        avatarUrl: h.avatarUrl,
        role: ROLES.HOST,
        authProvider: "google",
        isVerified: h.kycStatus === "verified",
        status: USER_STATUS.ACTIVE,
        city: h.city,
        coordinates: { lat: 19.076, lng: 72.8777 },
        preferredLanguages: h.languages,
        trustScore: h.hostTrustScore,
        totalBookings: h.totalCompletions,
        totalSpent: 0,
        referralCode: `PLUS-${h.displayName.substring(0, 4).toUpperCase()}`,
        createdAt: h.createdAt,
        updatedAt: now,
        lastLoginAt: now,
      };

      await DynamoDBClient.putItem(USERS_TABLE, hostUser);
      await DynamoDBClient.putItem(HOSTS_TABLE, h);
    }
    console.log(`✅ Seeded ${sampleHosts.length} sample hosts (and their corresponding user records).`);

    console.log(`\n🎉 SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`=======================================================`);
    console.log(`🔑 ADMIN LOGIN CREDENTIALS:`);
    console.log(`   Email:    admin@plusone.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   Role:     admin`);
    console.log(`=======================================================\n`);
  } catch (err) {
    console.error("❌ Error seeding admin and sample data:", err);
    process.exit(1);
  }
}

seedAdminAndSampleData();
