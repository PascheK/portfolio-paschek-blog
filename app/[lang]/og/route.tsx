import { ImageResponse } from "next/og";
import { metaData } from "@/lib/config";

// 1200×630 share image: dark surface, periwinkle accent, title. No external font (edge-safe).
export function GET(request: Request) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || metaData.name).slice(0, 140);
  const eyebrow = (url.searchParams.get("eyebrow") || "PascheK").slice(0, 40);
  const size = title.length > 90 ? 52 : title.length > 50 ? 64 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0c10",
          color: "#f2f3f7",
          padding: "72px 80px",
          borderLeft: "10px solid #97a8dd",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 4, color: "#97a8dd", textTransform: "uppercase" }}>
          {eyebrow}
        </div>
        <div style={{ display: "flex", fontSize: size, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#9aa0b4" }}>
          <span>{metaData.name}</span>
          <span>{new URL(metaData.baseUrl).host}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
