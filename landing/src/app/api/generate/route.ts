import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// This is a helper function to generate a single record based on the JSON schema
function generateRecord(schema: any): Record<string, any> {
  const record: Record<string, any> = {};

  for (const key in schema.properties) {
    const property = schema.properties[key];
    const { type, format, enum: enumValues, properties: objectProperties, items } = property;
    const keyLower = key.toLowerCase();

    if (type === "string") {
      if (format === "uuid" || keyLower.includes("id")) {
        record[key] = faker.string.uuid();
      } else if (format === "date-time") {
        record[key] = faker.date.recent({ days: 30 }).toISOString();
      } else if (enumValues) {
        record[key] = faker.helpers.arrayElement(enumValues);
      } else if (keyLower.includes("name") || keyLower.includes("title")) {
        record[key] = faker.person.fullName();
      } else if (keyLower.includes("gender")) {
        record[key] = faker.helpers.arrayElement(["Male", "Female", "Other"]);
      } else if (keyLower.includes("email")) {
        record[key] = faker.internet.email();
      } else if (keyLower === "merchant") {
        // Corrected: Explicitly generate a single company name for merchant
        record[key] = faker.company.name();
      } else if (keyLower.includes("organization")) {
        record[key] = faker.company.name();
      } else if (keyLower.includes("location") || keyLower.includes("address")) {
        record[key] = faker.location.city();
      } else if (keyLower.includes("bloodpressure")) {
        const systolic = faker.number.int({ min: 90, max: 140 });
        const diastolic = faker.number.int({ min: 60, max: 90 });
        record[key] = `${systolic}/${diastolic}`;
      } else {
        record[key] = faker.lorem.sentence();
      }
    } else if (type === "integer") {
      record[key] = faker.number.int({ min: property.minimum, max: property.maximum });
    } else if (type === "number") {
      if (keyLower.includes("amount") || keyLower.includes("total") || keyLower.includes("price") || keyLower.includes("budget")) {
        record[key] = faker.number.float({ min: 10, max: 1000, fractionDigits: 2 });
      } else {
        record[key] = faker.number.float();
      }
    } else if (type === "array") {
      if (items?.type === "string") {
        if (keyLower.includes("conditions")) {
          const conditions = [
            "Hypertension", "Diabetes", "Asthma", "Arthritis", "Migraine",
            "Obesity", "Anxiety", "Depression", "Allergies", "Insomnia",
            "High Cholesterol", "Chronic Back Pain"
          ];
          const arrayLength = faker.number.int({ min: 1, max: 3 });
          record[key] = faker.helpers.arrayElements(conditions, arrayLength).join(", ");
        } else {
          const arrayLength = faker.number.int({ min: 1, max: 3 });
          record[key] = Array.from({ length: arrayLength }, () => faker.lorem.word()).join(", ");
        }
      } else if (items?.type === "object" && items.properties) {
        const arrayLength = faker.number.int({ min: 1, max: 5 });
        const generatedItems = Array.from({ length: arrayLength }, () => {
          const item: Record<string, any> = {};
          for (const itemKey in items.properties) {
            const itemProperty = items.properties[itemKey];
            if (itemKey === "productId") {
              item[itemKey] = faker.commerce.isbn();
            } else if (itemKey === "quantity") {
              item[itemKey] = faker.number.int({ min: 1, max: 10 });
            } else if (itemKey === "price") {
              item[itemKey] = faker.number.float({ min: 1, max: 500, fractionDigits: 2 });
            }
          }
          return item;
        });
        record[key] = `"${JSON.stringify(generatedItems).replace(/"/g, '""')}"`;
      }
    } else if (type === "object" && objectProperties) {
      if (keyLower.includes("location")) {
        record[key] = {
          lat: faker.location.latitude(),
          lon: faker.location.longitude()
        };
      }
    }
  }
  return record;
}

// This helper function converts an array of objects to a CSV string
function convertToCsv(data: Record<string, any>[]): string {
  if (data.length === 0) {
    return "";
  }
  
  // Get the headers from the first record, in their original order
  let headerKeys = Object.keys(data[0]);

  // Reorder the fields to put 'lastVisit' before 'conditions' for the header
  const lastVisitIndex = headerKeys.indexOf('lastVisit');
  const conditionsIndex = headerKeys.indexOf('conditions');
  if (lastVisitIndex !== -1 && conditionsIndex !== -1 && lastVisitIndex > conditionsIndex) {
    const reorderedKeys = [...headerKeys];
    reorderedKeys[lastVisitIndex] = headerKeys[conditionsIndex];
    reorderedKeys[conditionsIndex] = headerKeys[lastVisitIndex];
    headerKeys = reorderedKeys;
  }
  const header = headerKeys.join(",");

  const rows = data.map(row => {
    return headerKeys.map(key => {
      const value = row[key];
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      return value;
    }).join(",");
  });
  return [header, ...rows].join("\n");
}

export async function POST(req: Request) {
  const { templateId, count } = await req.json();

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) {
    return new Response(JSON.stringify({ error: "Template not found" }), { status: 404 });
  }

  try {
    const templateSchema = JSON.parse(template.content);
    const generatedRecords: Record<string, any>[] = [];

    for (let i = 0; i < count; i++) {
      generatedRecords.push(generateRecord(templateSchema));
    }

    const csvData = convertToCsv(generatedRecords);

    await prisma.syntheticData.create({
      data: {
        templateId,
        data: JSON.stringify(generatedRecords[0]),
      },
    });

    return new Response(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="synthetic-data-${template.name.replace(/\s+/g, '-').toLowerCase()}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to generate data" }), { status: 500 });
  }
}