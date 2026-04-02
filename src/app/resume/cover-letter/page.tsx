"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PrintButton } from "../PrintButton";

function CoverLetterContent() {
  const searchParams = useSearchParams();
  const text = searchParams.get("text") || "";
  const jobTitle = searchParams.get("job") || "";
  const company = searchParams.get("company") || "";

  if (!text) {
    return <p className="p-10 text-gray-500">No cover letter content provided.</p>;
  }

  return (
    <article className="mx-auto max-w-[700px] bg-white px-10 py-12 text-[#111] print:px-0 print:py-0">
      {/* Nav — hidden in print */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <button
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 underline hover:text-gray-800"
        >
          &larr; Back
        </button>
        <div className="flex items-center gap-3">
          {jobTitle && (
            <span className="rounded-lg bg-teal-100 px-3 py-1 text-sm font-medium text-teal-700">
              {jobTitle}{company ? ` @ ${company}` : ""}
            </span>
          )}
          <PrintButton />
        </div>
      </div>

      {/* Cover letter body */}
      <div className="text-[14px] leading-[1.7] text-gray-800 whitespace-pre-wrap">
        {text}
      </div>

      {/* Print styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body { background: white !important; color: #111 !important; }
              @page { margin: 1in; size: A4; }
              a { color: #111 !important; text-decoration: none !important; }
              article { padding: 0 !important; max-width: none !important; }
            }
          `,
        }}
      />
    </article>
  );
}

export default function CoverLetterPage() {
  return (
    <Suspense fallback={<p className="p-10 text-gray-500">Loading...</p>}>
      <CoverLetterContent />
    </Suspense>
  );
}
