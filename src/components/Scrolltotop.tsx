import { useEffect } from "react";
import { useLocation } from "react-router";

/**
 * Scrolls the window to the top on every route change.
 * React Router does client-side navigation, so the browser's native
 * scroll-reset behavior (which happens on a full page load) never fires.
 * This component has no visual output — it just listens for pathname
 * changes and calls window.scrollTo.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;