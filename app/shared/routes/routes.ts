export const ROUTES = {
  HOME: "/home",
  COLECCION: "/coleccion",
  COLECCION_PAGE: (page: number) => `/coleccion?page=${page}`,
  PRODUCT: (slug: string) => `/coleccion/producto/${encodeURIComponent(slug)}`,
  PERSONALIZACION: "/personalizacion",
  CONTACTO: "/contacto",
  LOGIN: "/login",
  LOGIN_ERROR: (error: string) => `/login?error=${encodeURIComponent(error)}`,
  CART: "/carrito",
  DASHBOARD: {
    HOME: "/dashboard",
    PRODUCTS: "/dashboard/productos",
    NEW_PRODUCT: "/dashboard/productos/nuevo",
    EDIT_PRODUCT: (id: string) =>
      `/dashboard/productos/${encodeURIComponent(id)}/editar`,
    FEATURED: "/dashboard/destacados",
    CONFIGURATION: "/dashboard/configuracion",
  },
} as const;
