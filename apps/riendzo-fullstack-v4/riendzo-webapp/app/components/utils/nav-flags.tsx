'use client';

import { createContext, useContext } from 'react';

/** "Em breve" flags set in the BackOffice (Administrador > Menus). Key = section id or submenu href. */
const NavFlagsContext = createContext<Record<string, boolean>>({});

export function NavFlagsProvider({ flags, children }: { flags: Record<string, boolean>; children: React.ReactNode }) {
  return <NavFlagsContext.Provider value={flags}>{children}</NavFlagsContext.Provider>;
}

export const useNavFlags = () => useContext(NavFlagsContext);
