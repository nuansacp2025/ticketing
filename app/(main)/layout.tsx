import Image from "next/image";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative w-dvw h-dvh flex items-center justify-center overflow-y-auto">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/background.jpg" alt="Background" fill
          className="blur-xs object-cover"
        />
        <div className="absolute inset-0 z-10 bg-black/60" />
      </div>
      {children}
    </div>
  );
}
