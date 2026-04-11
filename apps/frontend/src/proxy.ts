// next-intl proxy middleware: applies locale routing and excludes static/internal Next.js paths.

import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"]
};