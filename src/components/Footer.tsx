import { APP_INFO } from "../config/app";

export function Footer() {
  return (
    <footer>
      {APP_INFO.name}
      <span>Created by {APP_INFO.author}</span>
      <span>{APP_INFO.copyright}</span>
      <span>Version {APP_INFO.version}</span>
    </footer>
  );
}
