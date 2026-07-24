const DEFAULT_SETTINGS = {
  shop_wishlist: true,
};

export async function loadShopSettings() {
  try {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (!baseUrl) return DEFAULT_SETTINGS;

    const response = await fetch(`${baseUrl}/settings/public`);
    if (!response.ok) return DEFAULT_SETTINGS;

    return { ...DEFAULT_SETTINGS, ...(await response.json()) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

