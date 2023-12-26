import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  const body = await request.json();
  
  const { cards } = body;
  try {
    const createdCards = await prisma.card.createMany({
      data: cards,
    });
    console.log(`Posted Data ${createdCards}`);
    return NextResponse.redirect('/app/collection/page');
  } catch (error) {
    console.log(`Error adding cards to the database: ${error}`);
    return NextResponse.error({ error: 'Failed to POST cards to database'});
  }
}