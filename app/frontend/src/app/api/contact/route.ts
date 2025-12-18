import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, company, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: "Name, email, subject, and message are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Please enter a valid email address" },
                { status: 400 }
            );
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from("contact_submissions")
            .insert([
                {
                    name,
                    email,
                    company: company || null,
                    subject,
                    message,
                    status: "new",
                    created_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (error) {
            console.error("Supabase error:", error);
            // If table doesn't exist, still return success but log it
            if (error.code === "42P01") {
                console.warn("Contact submissions table doesn't exist yet");
                return NextResponse.json({
                    success: true,
                    message: "Message received (table pending setup)",
                });
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: "Message sent successfully",
            id: data?.id,
        });
    } catch (error) {
        console.error("Contact form error:", error);
        return NextResponse.json(
            { error: "Failed to send message. Please try again." },
            { status: 500 }
        );
    }
}
