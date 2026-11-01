
import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";

export const runtime = "nodejs";
export const maxDuration = 300;

const VOICES = [
  "bn-BD-PradeepNeural",
  "bn-BD-NabanitaNeural",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lines = body?.lines;

    if (
      !Array.isArray(lines) ||
      lines.length < 1 ||
      lines.length > 20
    ) {
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

    const audioParts: Buffer[] = [];

    for (const line of lines) {
      const tts = new EdgeTTS({
        voice: line.voice,
        lang: "bn-BD",
        timeout: 60000,
      });

      for await (const chunk of tts.streamAudio(line.text.trim())) {
        if (Buffer.isBuffer(chunk)) {
          audioParts.push(chunk);
        }
      }
    }

    if (audioParts.length === 0) {
      throw new Error("কোনো অডিও পাওয়া যায়নি।");
    }

    const audio = Buffer.concat(audioParts);

    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="VYRONIX-dialogue.mp3"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Voice generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ভয়েস তৈরি করা যায়নি। আবার চেষ্টা করুন।",
      },
      { status: 500 }
    );
  }
}
