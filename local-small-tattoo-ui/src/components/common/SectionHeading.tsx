type SectionHeadingProps = {
  title: string;
  align?: "left" | "center";
};

export function SectionHeading({ title, align = "left" }: SectionHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      <h2 className="section-heading__title">{title}</h2>
    </header>
  );
}
