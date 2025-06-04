export function Loading({ text }: { text?: string }) {
  return (
    <div className="flex items-center space-x-3">
      <svg className="size-6 sm:size-8 animate-spin text-foreground" viewBox="0 0 24 24">
        {/* https://stackoverflow.com/questions/74271099/tailwindcss-animate-spin-not-showing-up */}
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="text-base sm:text-lg">{text ?? "Loading..."}</span>
    </div>
  );
}