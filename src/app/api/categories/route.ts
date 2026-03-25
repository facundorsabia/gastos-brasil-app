import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getCategories, addCategory, deleteCategory } from "@/lib/store";

export async function GET() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const categories = await getCategories();
        return NextResponse.json({ categories });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { name } = await request.json();
        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Invalid name" }, { status: 400 });
        }
        const cat = await addCategory(name.trim());
        return NextResponse.json({ category: cat });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const url = new URL(request.url);
        const name = url.searchParams.get("name");
        if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

        const success = await deleteCategory(name);
        return NextResponse.json({ success });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
