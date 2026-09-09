import { ImageResponse } from "next/og";
import { siteConfig, products } from "@/data/portfolio";

export const alt = `${siteConfig.name} — ${siteConfig.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0e17",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 24,
              letterSpacing: 4,
              color: "#5eead4",
              fontWeight: 600,
            }}
          >
            {siteConfig.website.replace("https://", "").toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: "#eae5ec",
              lineHeight: 1.05,
              marginTop: 28,
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              fontSize: 40,
              color: "#94a3b8",
              marginTop: 20,
            }}
          >
            {`${siteConfig.title} · ${siteConfig.location}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ height: 4, width: 96, backgroundColor: "#5eead4" }} />
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 28,
              fontSize: 28,
              color: "#eae5ec",
            }}
          >
            <span>{siteConfig.yearsOfExperience} years</span>
            <span style={{ color: "#334155" }}>·</span>
            <span>{products.map((product) => product.name).join(" · ")}</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
