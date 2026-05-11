import * as WebBrowser from "expo-web-browser";
import { ENV } from "@/constants/env";
import { AppButton } from "./AppButton";

type Props = {
  label?: string;
  path?: string;
};

/** Opens marketing / web app in in-app browser (or system browser). */
export function WebsiteLinkButton({ label = "Open full website", path = "" }: Props) {
  const base = ENV.webBaseUrl;
  const url = path ? `${base}${path.startsWith("/") ? path : `/${path}`}` : base;
  return (
    <AppButton
      title={label}
      variant="secondary"
      onPress={() => {
        if (!url) return;
        void WebBrowser.openBrowserAsync(url);
      }}
      disabled={!url}
    />
  );
}
