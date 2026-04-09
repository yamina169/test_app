import { MapPin, FileText, Bot, BarChart3, Palette, Navigation } from "lucide-react";
import { ServiceItem } from "../models/services";

export const SERVICES: ServiceItem[] = [
    { key: "safe-spaces", Icon: MapPin, titleKey: "items.safeSpaces.title", descriptionKey: "items.safeSpaces.description" },
    { key: "submit-forms", Icon: FileText, titleKey: "items.submitForms.title", descriptionKey: "items.submitForms.description" },
    { key: "ai-assistant", Icon: Bot, titleKey: "items.aiAssistant.title", descriptionKey: "items.aiAssistant.description" },
    { key: "track-status", Icon: BarChart3, titleKey: "items.trackStatus.title", descriptionKey: "items.trackStatus.description" },
    { key: "accessible-design", Icon: Palette, titleKey: "items.accessibleDesign.title", descriptionKey: "items.accessibleDesign.description" },
    { key: "nearby-services", Icon: Navigation, titleKey: "items.nearbyServices.title", descriptionKey: "items.nearbyServices.description" },
];