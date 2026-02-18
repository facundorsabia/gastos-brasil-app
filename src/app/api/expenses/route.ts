import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { withConversion } from "@/lib/exchange";
import { createExpense, getExpenses } from "@/lib/store";
import { validateExpenseInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const user = getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expenses = await getExpenses();
  return NextResponse.json({ expenses: withConversion(expenses) });
}

export async function POST(request: NextRequest) {
  const user = getSessionFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const input = validateExpenseInput(payload);
  if (!input) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const expense = await createExpense(input);
  return NextResponse.json({ expense }, { status: 201 });
}
