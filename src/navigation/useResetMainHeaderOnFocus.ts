import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useAppShell } from "./AppShellContext";

/** Call from each main tab screen so the Trek Guider bar returns when switching Home / Trips / Profile. */
export function useResetMainHeaderOnFocus() {
  const { resetMainHeader } = useAppShell();
  useFocusEffect(
    useCallback(() => {
      resetMainHeader();
    }, [resetMainHeader]),
  );
}
