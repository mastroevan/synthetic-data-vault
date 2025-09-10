import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: { json: () => PromiseLike<{ templateId: any; variables: any; }> | { templateId: any; variables: any; }; }) {
  const { templateId, variables } = await req.json();

  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) return new Response(JSON.stringify({ error: "Template not found" }), { status: 404 });

  // Replace placeholders in template content
  let data = template.content;
  for (const key in variables) {
    const regex = new RegExp(`{${key}}`, "g");
    data = data.replace(regex, variables[key]);
  }

  const synthetic = await prisma.syntheticData.create({
    data: { templateId, data },
  });

  return new Response(JSON.stringify(synthetic), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}