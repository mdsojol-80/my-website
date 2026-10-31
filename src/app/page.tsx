import Generator from "@/components/Generator";
import VoiceStudio from "@/components/VoiceStudio";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-8 bg-zinc-50 px-4 py-8 dark:bg-black">
      <Generator />
      <div className="mx-auto w-full max-w-3xl">
        <VoiceStudio />
      </div>
    </main>
  );
}
