"use client";

import { useState } from "react";

type Dialogue = {
  id: number;
  character: string;
  text: string;
  voice: string;
};

const newLine = (id: number): Dialogue => ({
  id,
  character: "",
  text: "",
  voice: "bn-BD-PradeepNeural",
});

export default function VoiceStudio() {
  const [lines, setLines] = useState<Dialogue[]>([
    {
      id: 1,
      character: "ছেলে",
      text: "এই মুরগি, তুমি আমার পিছু নিয়েছ কেন?",
      voice: "bn-BD-PradeepNeural",
    },
    {
      id: 2,
      character: "মুরগি",
      text: "কুঁকড়ু কুঁ! তোমার খাবার কোথায়?",
      voice: "bn-BD-NabanitaNeural",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  function updateLine(id: number, field: keyof Dialogue, value: string) {
    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, [field]: value } : line
      )
    );
  }

  function addLine() {
    setLines((current) => [...current, newLine(Date.now())]);
  }

  function removeLine(id: number) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  async function generateAudio() {
    setLoading(true);
    setError("");
    setAudioUrl("");

    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map(({ character, text, voice }) => ({
            character,
            text,
            voice,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "ভয়েস তৈরি করা যায়নি।");
      }

      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "একটি সমস্যা হয়েছে।"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h2 className="text-xl font-semibold">Voice & Dialogue Studio</h2>
        <p className="mt-1 text-sm text-neutral-500">
          চরিত্রের সংলাপ লিখে বাংলা AI ভয়েস তৈরি করো।
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {lines.map((line, index) => (
          <div
            key={line.id}
            className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">
                Dialogue {index + 1}
              </span>
              {lines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="text-xs text-red-500"
                >
                  Remove
                </button>
              )}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Character name</span>
              <input
                value={line.character}
                onChange={(e) =>
                  updateLine(line.id, "character", e.target.value)
                }
                placeholder="যেমন: ছেলে"
                className="rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Dialogue text</span>
              <textarea
                value={line.text}
                onChange={(e) =>
                  updateLine(line.id, "text", e.target.value)
                }
                rows={2}
                maxLength={500}
                placeholder="এখানে সংলাপ লেখো..."
                className="resize-y rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-neutral-500">Bangla AI voice</span>
              <select
                value={line.voice}
                onChange={(e) =>
                  updateLine(line.id, "voice", e.target.value)
                }
                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="bn-BD-PradeepNeural">
                  Pradeep — Male
                </option>
                <option value="bn-BD-NabanitaNeural">
                  Nabanita — Female
                </option>
              </select>
            </label>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addLine}
        disabled={lines.length >= 20 || loading}
        className="rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700 disabled:opacity-40"
      >
        + Add dialogue
      </button>

      <button
        type="button"
        onClick={generateAudio}
        disabled={
          loading ||
          lines.length === 0 ||
          lines.some((line) => !line.text.trim())
        }
        className="rounded-lg bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {loading ? "Generating Bengali voices..." : "Generate all dialogue audio"}
      </button>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {audioUrl && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-700">
          <h3 className="text-sm font-semibold">Combined dialogue audio</h3>
          <audio controls src={audioUrl} className="w-full" />
          <a
            href={audioUrl}
            download="VYRONIX-dialogue.mp3"
            className="text-center text-sm font-medium underline underline-offset-4"
          >
            Download MP3
          </a>
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Requires internet. Maximum 20 dialogue lines, 500 characters per line.
      </p>
    </section>
  );
}
