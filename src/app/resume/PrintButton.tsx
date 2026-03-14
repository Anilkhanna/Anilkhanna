"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg bg-[#0a0e17] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a1f2e] cursor-pointer"
    >
      Download PDF
    </button>
  );
}
