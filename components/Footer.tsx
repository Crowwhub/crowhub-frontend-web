export default function Footer() {
  return (
    <footer className="relative border-t border-[#222] py-16 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="font-syne font-extrabold text-cream whitespace-nowrap"
          style={{
            fontSize: "clamp(80px, 16vw, 200px)",
            letterSpacing: "-6px",
            opacity: 0.04,
            lineHeight: 1,
          }}
        >
          CROWHUB
        </span>
      </div>
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
        <div className="font-syne text-base font-extrabold text-gray-4">
          CrowHub
        </div>
        <ul className="flex gap-6 list-none">
          {["Privacy", "Terms", "About", "Contact"].map((label) => (
            <li key={label}>
              <a
                href="#"
                className="text-xs text-gray-4 no-underline transition-colors hover:text-gray-6"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <div className="text-xs text-gray-4">© 2026 CrowHub</div>
      </div>
    </footer>
  );
}
