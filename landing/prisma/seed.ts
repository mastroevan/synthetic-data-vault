import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear old templates (optional)
  await prisma.template.deleteMany();

  // Insert example templates
  await prisma.template.createMany({
    data: [
      {
        name: "Healthcare Patients",
        content: JSON.stringify({
          type: "object",
          properties: {
            patientId: { type: "string", format: "uuid" },
            name: { type: "string" },
            age: { type: "integer", minimum: 0, maximum: 100 },
            gender: { type: "string", enum: ["Male", "Female", "Other"] },
            bloodPressure: { type: "string" },
            conditions: { type: "array", items: { type: "string" } },
            lastVisit: { type: "string", format: "date-time" }
          },
          required: ["patientId", "name", "age", "gender"]
        })
      },
      {
        name: "E-commerce Orders",
        content: JSON.stringify({
          type: "object",
          properties: {
            orderId: { type: "string", format: "uuid" },
            customerId: { type: "string", format: "uuid" },
            orderDate: { type: "string", format: "date-time" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: { type: "string" },
                  quantity: { type: "integer", minimum: 1 },
                  price: { type: "number" }
                },
                required: ["productId", "quantity", "price"]
              }
            },
            total: { type: "number" }
          },
          required: ["orderId", "customerId", "items", "total"]
        })
      },
      {
        name: "Financial Transactions",
        content: JSON.stringify({
          type: "object",
          properties: {
            transactionId: { type: "string", format: "uuid" },
            userId: { type: "string" },
            amount: { type: "number" },
            currency: { type: "string", enum: ["USD", "EUR", "GBP"] },
            merchant: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
            location: {
              type: "object",
              properties: {
                lat: { type: "number" },
                lon: { type: "number" }
              }
            }
          },
          required: ["transactionId", "userId", "amount", "currency", "merchant"]
        })
      }
    ]
  });

  console.log("✅ Seed data inserted!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });