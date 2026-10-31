import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

export const runtime = "nodejs";
export const maxDuration = 300;

const VOICES = [
  "bn-BD-PradeepNeural",
  "bn-BD-NabanitaNeural",
];

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args);
    let error = "";

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(error.slice(-1500) || `${command} failed`));
    });
  });
}

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const lines = (body as { lines?: unknown })?.lines;

  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 20) {
    return NextResponse.json(
      { error: "১ থেকে ২০টি সংলাপ দিতে হবে।" },
      { status: 400 }
    );
  }

  for (const line of lines) {
    if (
      !line ||
      typeof line.text !== "string" ||
      !line.text.trim() ||
      line.text.length > 500 ||
      !VOICES.includes(line.voice)
    ) {
      return NextResponse.json(
        { error: "সংলাপ বা ভয়েস নির্বাচন সঠিক নয়।" },
        { status: 400 }
      );
    }
  }

  const id = randomUUID();
  const outputDir = path.join(process.cwd(), "public", "generated", id);
  const files: string[] = [];

  try {
    await mkdir(outputDir, { recursive: true });

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] as { text: string; voice: string };
      const file = path.join(outputDir, `${i}.mp3`);

      await run("edge-tts", [
        "--voice", line.voice,
        "--text", line.text.trim(),
        "--write-media", file,
      ]);

      files.push(file);
    }

    const listFile = path.join(outputDir, "list.txt");
    const list = files
      .map((file) => `file '${file.replace(/'/g, "'\\''")}'`)
      .join("\n");

    await writeFile(listFile, list);

    const finalFile = path.join(outputDir, "dialogue.mp3");

    await run("ffmpeg", [
      "-y",
      "-f", "concat",
      "-safe", "0",
      "-i", listFile,
      "-c:a", "libmp3lame",
      "-b:a", "128k",
      finalFile,
    ]);

    return NextResponse.json({
      audioUrl: `/generated/${id}/dialogue.mp3`,
      count: lines.length,
    });
  } catch (error) {
    await rm(outputDir, { recursive: true, force: true });
    const message =
      error instanceof Error ? error.message : "Voice generation failed.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
