import ContactSection from "./contact-section";
import HeroSection from "./hero-section";
import MobileExperienceSection from "./mobile-experience-section";
import ServicesSection from "./service-section";
import SiteHeader from "./site-header";

export default function LandingPage() {
    return (
        <>
            <SiteHeader />

            {/* 
                Accessibility: Makes <main> programmatically focusable so the skip link
                can correctly move keyboard focus here (WCAG 2.4.1 Bypass Blocks).
                tabIndex={-1} ensures it is not part of normal tab order.
            */}
            <main id="main-content" tabIndex={-1}>
                <HeroSection />
                <ServicesSection />
                <MobileExperienceSection />
                <ContactSection />
                {/* <InstitutionsSection />
                 */}
            </main>

            {/* <SiteFooter />
            <AccessibilityPanel /> */}
        </>
    );
}