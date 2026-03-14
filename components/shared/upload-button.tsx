"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Loader2, Upload } from "lucide-react";

interface UploadButtonProps {
  locationId: string;
  onUploadComplete?: () => void;
}

export function UploadButton({ locationId, onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Get presigned URL
      const { uploadUrl, imageUrl } = await api.getUploadUrl(file.name, file.type);

      // 2. Upload to DO Spaces
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          "x-amz-acl": "public-read",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image to storage.");
      }

      // 3. Create photo record in backend
      await api.createPhoto({
        imageUrl,
        locationId,
        celestialTarget: "New Capture", // Could be a prompt
      });

      alert("Photo uploaded successfully!");
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      alert(error instanceof Error ? error.message : "Failed to upload photo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        disabled={isUploading}
        className="rounded-xl font-bold gap-2"
        variant="default"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        {isUploading ? "Uploading..." : "Upload Photo"}
      </Button>
    </div>
  );
}
