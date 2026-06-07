"use client";

import Sidebar from "@/components/Sidebar";

export default function NotificationsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute top-[12%] right-[16%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.12] animate-blob-1"
          style={{
            background:
              "radial-gradient(circle, rgba(106,171,122,0.5), transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-[14%] left-[26%] w-[460px] h-[460px] rounded-full blur-3xl opacity-[0.10] animate-blob-2"
          style={{
            background:
              "radial-gradient(circle, rgba(224,155,69,0.45), transparent 65%)",
          }}
        />
      </div>

      <Sidebar />

      <main className="md:pl-[260px] min-h-screen flex items-center justify-center px-8">
        <div className="flex flex-col items-center text-center max-w-[420px]">
          <div className="text-[52px] mb-5 inline-block animate-icon-glow">🔔</div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-gray-5 mb-2">
            Notifications
          </div>
          <h1 className="font-syne text-[30px] font-extrabold tracking-[-1px] text-cream leading-tight mb-3">
            Coming soon
          </h1>
          <p className="text-[14px] text-gray-5 leading-[1.6] font-light">
            We're building a notification feed — likes on your profile, new
            matches, and messages will show up here. Hang tight. 🚧
          </p>
        </div>
      </main>
    </div>
  );
}
