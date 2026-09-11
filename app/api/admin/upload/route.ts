import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

const BUCKET = "blog-images";
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const folderRaw = formData.get("folder");
  const folder = typeof folderRaw === "string" && /^[a-z-]+$/.test(folderRaw) ? folderRaw : "posts";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Unsupported file type. Use PNG, JPEG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: "File is too large (max 5MB)." }, { status: 400 });
  }

  const ext = file.type.split("/")[1];
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const path = `${folder}/${Date.now()}-${randomSuffix}.${ext}`;

  const admin = getSupabaseAdmin();
  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    console.error("admin upload failed", uploadError);
    return NextResponse.json({ ok: false, error: "Upload failed." }, { status: 500 });
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ ok: true, url: data.publicUrl });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  let body: { url?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.url !== "string") {
    return NextResponse.json({ ok: false, error: "Missing url." }, { status: 400 });
  }

  const path = pathFromPublicUrl(body.url);
  if (!path) {
    return NextResponse.json({ ok: true });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(BUCKET).remove([path]);

  if (error) {
    console.error("admin upload delete failed", error);
  }

  return NextResponse.json({ ok: true });
}
