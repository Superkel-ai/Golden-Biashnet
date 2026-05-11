export const uploadToCloudinary = async (file) => {
  const cloudName = "dh7srsqbp";
  const uploadPreset = "biashnet";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!data.secure_url || !data.public_id) {
      throw new Error("Upload failed");
    }

    const original = data.secure_url;

    // 🔥 Optimized versions
    const full = original.replace(
      "/upload/",
      "/upload/q_auto,f_auto,w_900/"
    );

    const thumb = original.replace(
      "/upload/",
      "/upload/q_auto,f_auto,w_300/"
    );

    const small = original.replace(
      "/upload/",
      "/upload/q_auto,f_auto,w_100/"
    );

    return {
      full,                 // for product detail page
      thumb,                // for grids (FAST)
      small,                // for ultra-fast previews (optional)
      original,             // backup/original
      public_id: data.public_id, // 🔥 REQUIRED for delete
      format: data.format,       // optional (jpg, png, webp)
      bytes: data.bytes,         // file size (for analytics)
    };

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};