import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { id: "asc" }
    });

    // WAJIB: return ARRAY langsung!
    return Response.json(customers);
  } catch (error) {
    return Response.json([], { status: 500 }); // Tetap return array
  }
}
