import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("start");
        const endDate = searchParams.get("end");

        let query = supabase
            .from("calendar_events")
            .select("*")
            .eq("profile_id", user.id)
            .order("event_date", { ascending: true });

        if (startDate) {
            query = query.gte("event_date", startDate);
        }

        if (endDate) {
            query = query.lte("event_date", endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error("[Calendar] Error fetching events:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ events: data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[Calendar] Error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            book_id,
            title,
            description,
            event_date,
            event_type = "other",
            is_all_day = true,
            start_time,
            end_time,
            reminder_enabled = false,
            reminder_minutes = 60,
        } = body;

        if (!title || !event_date) {
            return NextResponse.json(
                { error: "Title and event_date are required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("calendar_events")
            .insert({
                profile_id: user.id,
                book_id,
                title,
                description,
                event_date,
                event_type,
                is_all_day,
                start_time,
                end_time,
                reminder_enabled,
                reminder_minutes,
            })
            .select()
            .single();

        if (error) {
            console.error("[Calendar] Error creating event:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ event: data }, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[Calendar] Error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
