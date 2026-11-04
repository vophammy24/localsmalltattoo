import { Seo } from "../components/seo/Seo";
import { TestimonialsSection } from "../features/reviews/components/TestimonialsSection";
export function ReviewsPage() {
  return (
    <div className="reviews-page">
      <Seo
        title="Customer Reviews | Local Small Tattoo Da Nang"
        description="Read customer experiences at Local Small Tattoo in Da Nang, shared with permission. Explore ratings and full studio testimonials."
        path="/reviews"
      />
      <TestimonialsSection all />
    </div>
  );
}
