import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request) {
  const body = await request.json();

  const { cards } = body;

  try {
    const processedCards = await Promise.all(
      cards.map(async (card) => {
        const existingCard = await prisma.card.findFirst({
          where: {
            name: card.name,
            set: card.set,
          },
        });
        if (existingCard) {
          const updatedCard = await prisma.card.update({
            where: { id: existingCard.id },
            data: { quantity: existingCard.quantity + 1 },
          });

          console.log(`Card ${card.name} from set ${card.set} already exists. Quantity increased to ${updatedCard.quantity}.`);
          return updatedCard;
        } else {
          const createdCard = await prisma.card.create({
            data: { ...card, quantity: 1 },
          });
          console.log(`New card ${card.name} from set ${card.set} added to the database.`);
          return createdCard;
        }
      })
    );
  } catch (error) {
    console.error(`Error processing cards: ${error}`);
  }

  return NextResponse.json({ res: body });
}