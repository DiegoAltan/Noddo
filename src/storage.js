/*
 * Shim para window.storage (API propia del entorno de artifacts de Claude).
 * Hoy persiste en localStorage; el día que conectemos Supabase, esta es la
 * única pieza que hay que reemplazar (get/set con la misma firma async).
 */
const installBrowserStorage = () => {
  if (typeof window === "undefined") return;
  if (window.storage) return;

  window.storage = {
    async get(key) {
      const value = window.localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key, value) {
      window.localStorage.setItem(key, value);
      return true;
    },
  };
};

installBrowserStorage();
