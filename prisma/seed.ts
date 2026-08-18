import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const abc = await prisma.hotel.create({
    data: {
      name: "ABC Hotel",
      phone: "+919845000001",
      address: "Main Junction, Hometown",
      latitude: 12.9716,
      longitude: 77.5946,
      isOpen: true,
      menuItems: {
        create: [
          { name: "Chicken Biryani", price: 180, category: "Non-Veg", imageEmoji: "🍛" },
          { name: "Kabab Platter", price: 150, category: "Non-Veg", imageEmoji: "🍢" },
          { name: "Paneer Masala", price: 130, category: "Veg", imageEmoji: "🥘" },
          { name: "Sweet Lassi", price: 60, category: "Drinks", imageEmoji: "🥛" },
        ],
      },
      tables: {
        create: [
          { tableNumber: 1 },
          { tableNumber: 2 },
          { tableNumber: 3 },
        ],
      },
    },
  });

  const royal = await prisma.hotel.create({
    data: {
      name: "Royal Biryani",
      phone: "+919900000002",
      address: "Near Bus Stand, Hometown",
      latitude: 12.9800,
      longitude: 77.6000,
      isOpen: true,
      menuItems: {
        create: [
          { name: "Veg Fried Rice", price: 120, category: "Veg", imageEmoji: "🍚" },
          { name: "Cold Milk 500ml", price: 40, category: "Drinks", imageEmoji: "🥤" },
          { name: "Chicken Fry", price: 140, category: "Non-Veg", imageEmoji: "🍗" },
        ],
      },
    },
  });

  await prisma.rider.createMany({
    data: [
      { name: "Suresh", phone: "+919845012345", available: true },
      { name: "Manoj", phone: "+919900011122", available: false },
    ],
  });

  console.log("Seeded:", abc.name, "and", royal.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
