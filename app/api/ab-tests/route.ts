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

        const { data, error } = await supabase
            .from("ab_tests")
            .select(`
        *,
        variants:ab_test_variants(*)
      `)
            .eq("profile_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("[AB Tests] Error fetching tests:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ tests: data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[AB Tests] Error:", errorMessage);
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
            test_name,
            test_type,
            variants,
        } = body;

        if (!test_name || !test_type || !variants || variants.length < 2) {
            return NextResponse.json(
                { error: "Test name, type, and at least 2 variants are required" },
                { status: 400 }
            );
        }

        // Create the test
        const { data: test, error: testError } = await supabase
            .from("ab_tests")
            .insert({
                profile_id: user.id,
                book_id,
                test_name,
                test_type,
                status: "draft",
            })
            .select()
            .single();

        if (testError) {
            console.error("[AB Tests] Error creating test:", testError);
            return NextResponse.json({ error: testError.message }, { status: 500 });
        }

        // Create variants
        const variantsToInsert = variants.map((v: any) => ({
            test_id: test.id,
            variant_name: v.name,
            variant_data: v.data,
        }));

        const { data: createdVariants, error: variantsError } = await supabase
            .from("ab_test_variants")
            .insert(variantsToInsert)
            .select();

        if (variantsError) {
            console.error("[AB Tests] Error creating variants:", variantsError);
            // Rollback: delete the test
            await supabase.from("ab_tests").delete().eq("id", test.id);
            return NextResponse.json({ error: variantsError.message }, { status: 500 });
        }

        return NextResponse.json({
            test: { ...test, variants: createdVariants },
        }, { status: 201 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[AB Tests] Error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
