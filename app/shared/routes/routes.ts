export const ROUTES = {
    HOME: "/home",
    COLECCION: "/coleccion",
    PERSONALIZACION: "/personalizacion",
    CONTACTO: "/contacto",

    PRODUCTO: (id: string) => `/producto/${id}`,

    DASHBOARD: {
        INICIO: "/dashboard/",
        PRODUCTOS: "/dashboard/productos",
        COLECCION: "/dashboard/coleccion",
    }
}