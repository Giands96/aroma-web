// Services layer — data access to Supabase
// Each service encapsulates queries for a specific domain.
//
// products.service.ts  — getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct
// packs.service.ts     — getPacksByProductId, createPack, updatePack, deletePack
// config.service.ts    — getWhatsAppConfig, updateWhatsAppConfig, getCartLimits, updateCartLimits
// cloudinary.service.ts — uploadImageToCloudinary, deleteImageFromCloudinary
// auth.service.ts      — signInWithEmail, signOut, getCurrentUser
