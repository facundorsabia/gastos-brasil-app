import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { bulkUpdateCategory, bulkDeleteByCategory } from "@/lib/store";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = await request.json();
        const { action, oldCategory, newCategory, category } = payload;

        switch (action) {
            case "RENAME":
            case "REASSIGN":
                if (!oldCategory || !newCategory || typeof oldCategory !== "string" || typeof newCategory !== "string") {
                    return NextResponse.json({ error: "Missing or invalid category names" }, { status: 400 });
                }
                const updatedCount = await bulkUpdateCategory(oldCategory.trim(), newCategory.trim());
                return NextResponse.json({ success: true, action, updatedCount });

            case "DELETE_EXPENSES":
                if (!category || typeof category !== "string") {
                    return NextResponse.json({ error: "Missing or invalid category name" }, { status: 400 });
                }
                const deletedCount = await bulkDeleteByCategory(category.trim());
                return NextResponse.json({ success: true, action, deletedCount });

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
    }
}
