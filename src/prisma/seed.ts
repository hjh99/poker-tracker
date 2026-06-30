import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import crypto from "crypto"; // Native Node.js module to generate UUIDs safely

// 1. Establish a raw pg connection pool pointing to Aiven
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
// 2. Instantiate the Prisma 7 Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter directly into the new PrismaClient constructor
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding with Prisma 7 Adapter...");

  // 1. Safe teardown order (Children tables cleared first!)
  await prisma.playerSession.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.player.deleteMany({});
  await prisma.room.deleteMany({});

  console.log("🧹 Cleaned existing database tables.");

  // 2. Seed rooms via Prisma (Safe strings work fine)
  console.log("🏫 Creating club rooms...");
  await prisma.room.createMany({
    data: [
      { id: "sengkang-rounders", name: "Sengkang Rounders", passcode: "8888" },
      { id: "office-cash-game", name: "Office High Stakes", passcode: "1234" },
    ],
  });

  // 3. Seed players via Prisma (Safe strings work fine)
  console.log("👥 Creating player profiles...");
  const playersData = [
    { name: "Nicholas Ho" },
    { name: "Alex Chen" },
    { name: "Sarah Jenkins" },
    { name: "Marcus Vance" },
    { name: "Aron Lim" },
  ];

  const dbPlayers = [];
  for (const player of playersData) {
    const createdPlayer = await prisma.player.create({
      data: {
        name: player.name,
        roomId: "sengkang-rounders", 
        gamesPlayed: 0,
        lifetimeNetCents: 0,
      },
    });
    dbPlayers.push(createdPlayer);
    console.log(`   Created player: ${createdPlayer.name} (${createdPlayer.id})`);
  }

  // 4. Seed sessions using the native PG Pool (Bypasses Prisma's serialization proxy completely)
  console.log("⏳ Instantiating game sessions via native pg driver...");
  
  const session1Id = crypto.randomUUID();
  const session2Id = crypto.randomUUID();

  // Native PG queries treat the enum parameter safely as a string literal
  await pool.query(`
    INSERT INTO sessions (id, room_id, status, dollar_buy_in, starting_chips, small_blind, big_blind, start_time)
    VALUES ($1, $2, $3::"SessionStatus", $4, $5, $6, $7, NOW())
  `, [session1Id, "sengkang-rounders", "ACTIVE", 50, 500, 5, 10]);

  await pool.query(`
    INSERT INTO sessions (id, room_id, status, dollar_buy_in, starting_chips, small_blind, big_blind, start_time, end_time)
    VALUES ($1, $2, $3::"SessionStatus", $4, $5, $6, $7, NOW(), NOW())
  `, [session2Id, "office-cash-game", "COMPLETED", 200, 2000, 10, 20]);

  console.log(`   Injected sessions: ${session1Id} and ${session2Id}`);

  // 5. Seed player sessions using the native PG Pool
  console.log("🃏 Seating players into active sessions via native pg driver...");
  
  const playerSessions = [
    [crypto.randomUUID(), session1Id, dbPlayers[0].id, 500, null, false], // Nicholas Ho
    [crypto.randomUUID(), session1Id, dbPlayers[1].id, 1000, null, false], // Alex Chen
    [crypto.randomUUID(), session1Id, dbPlayers[2].id, 500, 750, true],   // Sarah Jenkins
  ];

  for (const record of playerSessions) {
    await pool.query(`
      INSERT INTO player_sessions (id, session_id, player_id, buy_in_chips, cash_out_chips, has_cashed_out, joined_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, record);
  }

  console.log("✅ Seeding complete! All data successfully committed directly.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Safely shut down the connection pool loop
  });