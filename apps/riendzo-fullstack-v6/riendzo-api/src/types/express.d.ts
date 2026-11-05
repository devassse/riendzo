import type { StaffPrincipal } from "../lib/auth";

declare global {
    namespace Express {
        interface Request {
            /** Preenchido por requireStaff */
            staff?: StaffPrincipal;
            /** Preenchido por requireMember */
            member?: { id: string };
        }
    }
}

export {};
