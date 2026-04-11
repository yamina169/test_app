import HeroSection from "../hero-section";
/* eslint-disable @next/next/no-img-element */
import { render, screen } from "@testing-library/react";
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      badge: "badge",
      title: "title",
      description: "description",
      ctaPrimary: "ctaPrimary",
      ctaSecondary: "ctaSecondary",
    };

    return translations[key] ?? key;
  },
}));

jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

jest.mock("next/image", () => {
  return function MockImage({
    src,
    alt,
    ...rest
  }: {
    src: string;
    alt: string;
  }) {
    return <img src={src} alt={alt} {...rest} />;
  };
});

describe("HeroSection", () => {
  it("renders hero content correctly", () => {
    render(<HeroSection />);

    const section = screen.getByRole("region", { name: "title" });
    expect(section).toHaveAttribute("id", "hero");

    expect(
      screen.getByRole("heading", { level: 1, name: "title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders CTAs with correct targets", () => {
    render(<HeroSection />);

    const primary = screen.getByRole("link", { name: /ctaPrimary/i });
    expect(primary).toHaveAttribute("href", "/login");

    const secondary = screen.getByRole("link", { name: /ctaSecondary/i });
    expect(secondary).toHaveAttribute("href", "#mission");
  });
});
