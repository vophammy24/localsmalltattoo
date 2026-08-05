export const IMAGE_UPLOAD_RULES = {
  maxFileSizeBytes: 20 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"],
  acceptedExtensions: ["jpg", "jpeg", "png", "webp", "heic", "heif"],
} as const;

export const IMAGE_INPUT_ACCEPT = [
  ...IMAGE_UPLOAD_RULES.acceptedTypes,
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
].join(",");

export function getImageFileError(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const hasAcceptedType = (IMAGE_UPLOAD_RULES.acceptedTypes as readonly string[]).includes(
    file.type.toLowerCase(),
  );
  const hasAcceptedExtension = (
    IMAGE_UPLOAD_RULES.acceptedExtensions as readonly string[]
  ).includes(extension);

  if (!hasAcceptedType && !hasAcceptedExtension) {
    return "Only JPG, JPEG, PNG, WebP, HEIC, and HEIF images are accepted.";
  }
  if (file.size >= IMAGE_UPLOAD_RULES.maxFileSizeBytes) {
    return "Each image must be smaller than 20 MB.";
  }
  return null;
}
