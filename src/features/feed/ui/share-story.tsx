import { Share2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ShareStoryProps {
  title: string;
  posterPath: string | null;
  rating: number | null;
  body: string | null;
  userName: string;
  avatarUrl: string | null;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function loadImageViaProxy(src: string): Promise<HTMLImageElement> {
  const proxyUrl = `${SUPABASE_URL}/functions/v1/image-proxy?url=${encodeURIComponent(src)}`;
  const res = await fetch(proxyUrl);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

async function generateStoryImage({
  title,
  posterPath,
  rating,
  body,
  userName,
  avatarUrl,
}: ShareStoryProps): Promise<Blob> {
  const W = 1080;
  const H = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE;

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Calculate total content height to center everything
  const posterW = 600;
  const posterH = 900;
  const avatarOverlap = 40;
  const titleH = 60;
  const starsH = rating ? 56 : 0;
  const bodyH = body ? Math.min(Math.ceil(body.length / 40), 4) * 44 + 30 : 0;
  const brandingH = 70;
  const totalH = avatarOverlap + posterH + titleH + starsH + bodyH + brandingH;
  const startY = Math.max(80, (H - totalH) / 2);

  const posterX = (W - posterW) / 2;
  const posterY = startY + avatarOverlap;

  if (posterPath) {
    try {
      const poster = await loadImageViaProxy(`${IMAGE_BASE}/w500${posterPath}`);
      ctx.save();
      roundRect(ctx, posterX, posterY, posterW, posterH, 24);
      ctx.clip();
      ctx.drawImage(poster, posterX, posterY, posterW, posterH);
      ctx.restore();
    } catch {
      ctx.fillStyle = "#1a1a1a";
      roundRect(ctx, posterX, posterY, posterW, posterH, 24);
      ctx.fill();
    }
  }

  // Poster border
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  roundRect(ctx, posterX, posterY, posterW, posterH, 24);
  ctx.stroke();

  // Avatar on top of poster (overlapping)
  if (avatarUrl) {
    try {
      const avatar = await loadImageViaProxy(avatarUrl);
      const avatarSize = 80;
      const avatarX = W / 2 - avatarSize / 2;
      const avatarY = posterY - avatarSize / 2;

      // White ring
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 4,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Clip circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2,
      );
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch {
      // Skip avatar if fails
    }
  }

  // Title
  let currentY = posterY + posterH + 70;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, W / 2, currentY, W - 120);
  currentY += 20;

  // Stars
  if (rating) {
    currentY += 40;
    const starSize = 36;
    const gap = 12;
    const totalW = starSize * 5 + gap * 4;
    let starX = (W - totalW) / 2;

    for (let i = 1; i <= 5; i++) {
      ctx.fillStyle = i <= rating ? "#facc15" : "#333333";
      drawStar(
        ctx,
        starX + starSize / 2,
        currentY + starSize / 2,
        starSize / 2,
        starSize / 4,
      );
      starX += starSize + gap;
    }
    currentY += starSize + 20;
  }

  // Comment
  if (body) {
    currentY += 20;
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "italic 32px sans-serif";
    ctx.textAlign = "center";

    const words = body.split(" ");
    let line = "";
    const maxWidth = W - 160;
    const lineHeight = 44;

    for (const word of words) {
      const testLine = line + (line ? " " : "") + word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(`"${line}"`, W / 2, currentY);
        line = word;
        currentY += lineHeight;
        if (currentY > H - 200) break;
      } else {
        line = testLine;
      }
    }
    if (line)
      ctx.fillText(
        body.split(" ").length === 1
          ? `"${line}"`
          : line.startsWith(body[0])
            ? `"${line}"`
            : line,
        W / 2,
        currentY,
      );
  }

  // Branding
  ctx.fillStyle = "#52525b";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${userName}`, W / 2, H - 120);
  ctx.fillStyle = "#3f3f46";
  ctx.font = "24px sans-serif";
  ctx.fillText("no CineDash", W / 2, H - 80);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
}

export function ShareStoryButton(props: ShareStoryProps) {
  const handleShare = async () => {
    const blob = await generateStoryImage(props);
    const file = new File([blob], "cinedash-story.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cinedash-story.png";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button
      variant="ghost"
      size="xs"
      className="text-muted-foreground"
      onClick={handleShare}
    >
      <Share2 className="size-3.5" />
      Story
    </Button>
  );
}
