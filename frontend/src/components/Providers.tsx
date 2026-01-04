'use client';

import { AuthProvider } from "../context/AuthContext";
import { UnitProvider } from "../context/UnitContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UnitProvider>
        {children}
      </UnitProvider>
    </AuthProvider>
  );
} 