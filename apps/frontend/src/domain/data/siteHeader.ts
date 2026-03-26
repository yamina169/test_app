import { NavLink } from "@/domain/models/siteHeader";

export const NAV_LINKS: NavLink[] = [
    { href: "#hero", key: "home", fallbackLabel: "Home" },
    { href: "#mission", key: "mission", fallbackLabel: "Our Mission" },
    { href: "#contact", key: "contact", fallbackLabel: "Contact" },
];