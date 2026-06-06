import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-45 animate-blob-1"
          style={{
            background:
              "radial-gradient(circle, rgba(106,171,122,0.55), transparent 65%)",
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-40 animate-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(224,155,69,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[440px] h-[440px] rounded-full blur-3xl opacity-25 animate-blob-3"
          style={{
            background:
              "radial-gradient(circle, rgba(180,140,200,0.35), transparent 65%)",
          }}
        />
      </div>

      <Link
        href="/"
        className="absolute top-8 left-8 z-10 flex items-center gap-2"
      >
        <img
          src="/crowhub_logo.png"
          alt="CrowHub logo"
          width={30}
          height={30}
          className="rounded-full"
        />
        <div className="font-syne font-extrabold text-[20px] tracking-[-0.5px] text-cream">
          Crow<span className="text-gray-5">Hub</span>
        </div>
      </Link>

      <main className="relative z-10 w-full flex justify-center">
        {children}
      </main>
    </div>
  );
}
