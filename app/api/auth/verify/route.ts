import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, error: error.message },
      { status: 401 }
    );
  }
}
