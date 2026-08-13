type CloudinaryImageOptions = {
  width: number;
  quality?: "auto" | "auto:eco" | "auto:good";
};

export function getCloudinaryImageUrl(
  url: string,
  { width, quality = "auto" }: CloudinaryImageOptions,
) {
  if (!url.includes("res.cloudinary.com/") || !url.includes("/upload/")) return url;

  return url.replace("/upload/", `/upload/f_auto,q_${quality},w_${width},c_limit/`);
}

export function getCloudinarySrcSet(url: string, widths = [400, 800, 1200]) {
  if (!url.includes("res.cloudinary.com/") || !url.includes("/upload/")) return undefined;

  return widths.map((width) => `${getCloudinaryImageUrl(url, { width })} ${width}w`).join(", ");
}
