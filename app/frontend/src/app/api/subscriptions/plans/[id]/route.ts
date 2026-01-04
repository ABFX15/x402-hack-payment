import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * PATCH /api/subscriptions/plans/[id] - Update a subscription plan
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        if (isSupabaseConfigured()) {
            const updateData: Record<string, unknown> = {
                updated_at: new Date().toISOString(),
            };

            if (body.active !== undefined) updateData.active = body.active;
            if (body.name !== undefined) updateData.name = body.name;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.amount !== undefined) updateData.amount = body.amount;

            const { error } = await supabase
                .from("subscription_plans")
                .update(updateData)
                .eq("id", id);

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json(
                    { error: "Failed to update subscription plan" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json(
            { error: "Failed to update subscription plan" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/subscriptions/plans/[id] - Delete a subscription plan
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (isSupabaseConfigured()) {
            // Check if there are active subscribers
            const { data: subscribers } = await supabase
                .from("subscriptions")
                .select("id")
                .eq("plan_id", id)
                .eq("status", "active")
                .limit(1);

            if (subscribers && subscribers.length > 0) {
                return NextResponse.json(
                    { error: "Cannot delete plan with active subscribers. Deactivate it instead." },
                    { status: 400 }
                );
            }

            const { error } = await supabase
                .from("subscription_plans")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("Supabase error:", error);
                return NextResponse.json(
                    { error: "Failed to delete subscription plan" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting plan:", error);
        return NextResponse.json(
            { error: "Failed to delete subscription plan" },
            { status: 500 }
        );
    }
}
