import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | HRMS Lite` : "HRMS Lite";
  }, [title]);
}
