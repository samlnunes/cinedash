import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Camera } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useAuthStore } from "@/features/auth";
import { supabase } from "@/lib/supabase";

async function getCroppedBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((r) => (image.onload = r));

  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.9);
  });
}

export function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Cropper state
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  useEffect(() => {
    if (!profile) return;

    setDisplayName(profile?.display_name);
  }, [profile]);

  const avatarUrl = profile?.avatar_url ?? undefined;
  const initials = (profile?.display_name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSaveName = async () => {
    if (!profile || !displayName.trim()) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", profile.id);

    if (error) {
      setMessage("Erro ao salvar nome.");
    } else {
      await fetchProfile(profile.id);
      setMessage("Nome atualizado!");
    }
    setSaving(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImage(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!cropImage || !croppedArea || !profile) return;

    setUploading(true);
    setMessage("");
    setCropImage(null);

    try {
      const blob = await getCroppedBlob(cropImage, croppedArea);
      const path = `${profile.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) {
        setMessage("Erro ao enviar foto.");
        setUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const url = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);

      if (updateError) {
        setMessage("Erro ao atualizar perfil.");
      } else {
        await fetchProfile(profile.id);
        setMessage("Foto atualizada!");
      }
    } finally {
      setUploading(false);
      URL.revokeObjectURL(cropImage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">Edite suas informações.</p>
      </div>

      <div className="max-w-sm space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Avatar className="size-24 hover:opacity-80 transition-opacity">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Camera className="size-4" />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          {uploading && (
            <p className="text-xs text-muted-foreground">Enviando...</p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome</label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
          />
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input value={user?.email ?? ""} disabled />
        </div>

        {message && <p className="text-sm text-green-500">{message}</p>}

        <Button
          onClick={handleSaveName}
          disabled={saving || !displayName.trim()}
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Crop Modal */}
      <Dialog
        open={!!cropImage}
        onOpenChange={(open) => {
          if (!open) {
            if (cropImage) URL.revokeObjectURL(cropImage);
            setCropImage(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Ajustar foto</DialogTitle>
          </DialogHeader>
          <div className="relative h-72 sm:h-80">
            {cropImage && (
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                style={{
                  containerStyle: { background: "var(--background)" },
                  cropAreaStyle: { border: "none" },
                  mediaStyle: { border: "none" },
                }}
              />
            )}
          </div>
          <DialogFooter className="p-4">
            <Button
              variant="outline"
              onClick={() => {
                if (cropImage) URL.revokeObjectURL(cropImage);
                setCropImage(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCropSave} disabled={uploading}>
              {uploading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
