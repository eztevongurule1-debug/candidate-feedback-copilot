import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    return NextResponse.json({
      text: `Resume uploaded successfully: ${file.name}

PDF text extraction is currently being prepared. For now, paste the resume text here after uploading.`,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to upload resume." },
      { status: 500 }
    );
  }
}