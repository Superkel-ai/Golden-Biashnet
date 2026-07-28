// src/components/product/share.js

/**
 * GOLDEN BIASHNET SHARE ENGINE
 * - WhatsApp / TikTok / Instagram friendly
 * - Image sharing support (mobile)
 * - Safe Firestore schema handling
 * - Fallback clipboard system
 */

export const shareProduct = async ({ post, onShare }) => {
  try {
    if (!post?.id) return;

    // =====================================================
    // SAFE IMAGE (Cloudinary supported)
    // =====================================================
    const image =
      post?.images?.[0]?.full ||
      post?.images?.[0]?.thumb ||
      "";

    // =====================================================
    // SHARE URL (FIXED ROUTE CONSISTENCY)
    // =====================================================
    const shareUrl = `${window.location.origin}/post/product/${post.id}`;

    // =====================================================
    // PRICES (SAFE PARSING)
    // =====================================================

    const isFlashSale = post?.flashSale === true;
    const isPromoted = post?.promoted === true;

    // =====================================================
    // BADGES
    // =====================================================
    const badges = [];

    if (isFlashSale) badges.push("🔥 FLASH SALE");
    if (isPromoted) badges.push("⭐ PROMOTED");
    // =====================================================
    // SHARE TEXT (OPTIMIZED FOR WHATSAPP + IG + TIKTOK)
    // =====================================================
    const shareText = `
🛍️ ${post?.title || "Product"}
${isFlashSale ? "⚡ FLASH SALE LIVE NOW!" : ""}
${isPromoted ? "⭐ Featured Product" : ""}
🛒 Buy Now:
👉 ${shareUrl}
@Biashnet BUY & SELL ONLINE 
${badges.length ? "\n" + badges.join(" • ") : ""}
    `.trim();

    // =====================================================
    // IMAGE SHARE (MOBILE ONLY SAFE)
    // =====================================================
    if (navigator.canShare && image) {
      try {
        const res = await fetch(image);
        const blob = await res.blob();

        const file = new File([blob], "product.jpg", {
          type: blob.type || "image/jpeg",
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: post?.title || "Product",
            text: shareText,
            files: [file],
          });

          onShare?.(post);
          return;
        }
      } catch (err) {
        console.log("Image share fallback:", err);
      }
    }

    // =====================================================
    // NORMAL NATIVE SHARE
    // =====================================================
    if (navigator.share) {
      await navigator.share({
        title: post?.title || "Product",
        text: shareText,
        url: shareUrl,
      });

      onShare?.(post);
      return;
    }

    // =====================================================
    // FALLBACK (COPY TO CLIPBOARD)
    // =====================================================
    await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);

    alert("Product link copied to clipboard 🚀");

    onShare?.(post);

  } catch (error) {
    console.log("Share error:", error);
  }
};