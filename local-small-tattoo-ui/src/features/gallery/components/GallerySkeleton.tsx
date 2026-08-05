export function GallerySkeleton() {
  return (
    <div className="gallery-grid gallery-skeleton" aria-label="Loading gallery">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
