export const uploadImage = async (file) => {
  const cloudName = "dh7srsqbp";
  const uploadPreset = "biashnet";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Upload failed");
    }

    const original = data.secure_url;

    // 🔥 Extract public_id (VERY IMPORTANT for delete)
    const public_id = data.public_id;

    // 🔥 Optimized versions
    const full = original.replace(
      "/upload/",
      "/upload/q_auto,f_auto,w_900/"
    );

    const thumb = original.replace(
      "/upload/",
      "/upload/q_auto,f_auto,w_300/"
    );

    return {
      original,
      full,
      thumb,
      public_id, // 🔥 REQUIRED for delete
    };

  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};