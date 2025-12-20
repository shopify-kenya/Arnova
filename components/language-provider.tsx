"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en-US" | "en-GB" | "sw"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

const translations: Record<Language, Record<string, string>> = {
  "en-US": {
    // Navigation
    "nav.home": "Home",
    "nav.newArrivals": "New Arrivals",
    "nav.clothing": "Clothing",
    "nav.shoes": "Shoes",
    "nav.bags": "Bags",
    "nav.accessories": "Accessories",
    "nav.sale": "Sale",
    "nav.saved": "Saved",
    "nav.cart": "Cart",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.faq": "FAQ",
    "nav.careers": "Careers",
    "nav.shipping": "Shipping",
    "nav.returns": "Returns",
    "nav.privacy": "Privacy",
    "nav.terms": "Terms",
    "nav.cookies": "Cookies",
    "nav.sizeGuide": "Size Guide",

    // Authentication
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.logout": "Log Out",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.rememberMe": "Remember Me",

    // Common
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.addToCart": "Add to Cart",
    "common.addToSaved": "Save",
    "common.price": "Price",
    "common.currency": "Currency",
    "common.language": "Language",
    "common.loading": "Loading",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.close": "Close",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.reset": "Reset",
    "common.clear": "Clear",
    "common.apply": "Apply",
    "common.remove": "Remove",
    "common.update": "Update",
    "common.create": "Create",
    "common.total": "Total",
    "common.subtotal": "Subtotal",
    "common.quantity": "Quantity",
    "common.size": "Size",
    "common.color": "Color",
    "common.brand": "Brand",
    "common.category": "Category",
    "common.description": "Description",
    "common.reviews": "Reviews",
    "common.rating": "Rating",
    "common.availability": "Availability",
    "common.inStock": "In Stock",
    "common.outOfStock": "Out of Stock",

    // Pages
    "page.checkout": "Checkout",
    "page.orderSummary": "Order Summary",
    "page.paymentMethod": "Payment Method",
    "page.shippingAddress": "Shipping Address",
    "page.billingAddress": "Billing Address",
    "page.orderHistory": "Order History",
    "page.wishlist": "Wishlist",
    "page.accountSettings": "Account Settings",
    "page.personalInfo": "Personal Information",
    "page.changePassword": "Change Password",
    "page.notifications": "Notifications",
    "page.preferences": "Preferences",

    // Admin
    "admin.dashboard": "Dashboard",
    "admin.products": "Products",
    "admin.orders": "Orders",
    "admin.users": "Users",
    "admin.analytics": "Analytics",
    "admin.settings": "Settings",
    "admin.reports": "Reports",
    "admin.inventory": "Inventory",
    "admin.customers": "Customers",
    "admin.sales": "Sales",

    // Product
    "product.details": "Product Details",
    "product.specifications": "Specifications",
    "product.shipping": "Shipping Info",
    "product.returns": "Return Policy",
    "product.relatedItems": "Related Items",
    "product.customerReviews": "Customer Reviews",
    "product.writeReview": "Write a Review",
    "product.addToWishlist": "Add to Wishlist",
    "product.shareProduct": "Share Product",
    "product.compareProducts": "Compare Products",

    // Cart & Checkout
    "cart.empty": "Your cart is empty",
    "cart.continueShopping": "Continue Shopping",
    "cart.proceedToCheckout": "Proceed to Checkout",
    "cart.shippingCost": "Shipping Cost",
    "cart.tax": "Tax",
    "cart.discount": "Discount",
    "cart.couponCode": "Coupon Code",
    "cart.applyCoupon": "Apply Coupon",

    // Footer
    "footer.customerService": "Customer Service",
    "footer.quickLinks": "Quick Links",
    "footer.followUs": "Follow Us",
    "footer.newsletter": "Newsletter",
    "footer.subscribeNewsletter": "Subscribe to our newsletter",
    "footer.enterEmail": "Enter your email",
    "footer.subscribe": "Subscribe",
    "footer.copyright": "© 2024 Arnova. All rights reserved.",

    // Messages
    "message.itemAddedToCart": "Item added to cart",
    "message.itemRemovedFromCart": "Item removed from cart",
    "message.itemSaved": "Item saved to wishlist",
    "message.itemUnsaved": "Item removed from wishlist",
    "message.orderPlaced": "Order placed successfully",
    "message.profileUpdated": "Profile updated successfully",
    "message.passwordChanged": "Password changed successfully",
  },
  "en-GB": {
    // Navigation
    "nav.home": "Home",
    "nav.newArrivals": "New Arrivals",
    "nav.clothing": "Clothing",
    "nav.shoes": "Shoes",
    "nav.bags": "Bags",
    "nav.accessories": "Accessories",
    "nav.sale": "Sale",
    "nav.saved": "Favourites",
    "nav.cart": "Basket",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.faq": "FAQ",
    "nav.careers": "Careers",
    "nav.shipping": "Delivery",
    "nav.returns": "Returns",
    "nav.privacy": "Privacy",
    "nav.terms": "Terms",
    "nav.cookies": "Cookies",
    "nav.sizeGuide": "Size Guide",

    // Authentication
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.logout": "Log Out",
    "auth.register": "Register",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.rememberMe": "Remember Me",

    // Common
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.addToCart": "Add to Basket",
    "common.addToSaved": "Save",
    "common.price": "Price",
    "common.currency": "Currency",
    "common.language": "Language",
    "common.loading": "Loading",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.close": "Close",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.reset": "Reset",
    "common.clear": "Clear",
    "common.apply": "Apply",
    "common.remove": "Remove",
    "common.update": "Update",
    "common.create": "Create",
    "common.total": "Total",
    "common.subtotal": "Subtotal",
    "common.quantity": "Quantity",
    "common.size": "Size",
    "common.color": "Colour",
    "common.brand": "Brand",
    "common.category": "Category",
    "common.description": "Description",
    "common.reviews": "Reviews",
    "common.rating": "Rating",
    "common.availability": "Availability",
    "common.inStock": "In Stock",
    "common.outOfStock": "Out of Stock",

    // Pages
    "page.checkout": "Checkout",
    "page.orderSummary": "Order Summary",
    "page.paymentMethod": "Payment Method",
    "page.shippingAddress": "Delivery Address",
    "page.billingAddress": "Billing Address",
    "page.orderHistory": "Order History",
    "page.wishlist": "Wishlist",
    "page.accountSettings": "Account Settings",
    "page.personalInfo": "Personal Information",
    "page.changePassword": "Change Password",
    "page.notifications": "Notifications",
    "page.preferences": "Preferences",

    // Admin
    "admin.dashboard": "Dashboard",
    "admin.products": "Products",
    "admin.orders": "Orders",
    "admin.users": "Users",
    "admin.analytics": "Analytics",
    "admin.settings": "Settings",
    "admin.reports": "Reports",
    "admin.inventory": "Stock",
    "admin.customers": "Customers",
    "admin.sales": "Sales",

    // Product
    "product.details": "Product Details",
    "product.specifications": "Specifications",
    "product.shipping": "Delivery Info",
    "product.returns": "Return Policy",
    "product.relatedItems": "Related Items",
    "product.customerReviews": "Customer Reviews",
    "product.writeReview": "Write a Review",
    "product.addToWishlist": "Add to Wishlist",
    "product.shareProduct": "Share Product",
    "product.compareProducts": "Compare Products",

    // Cart & Checkout
    "cart.empty": "Your basket is empty",
    "cart.continueShopping": "Continue Shopping",
    "cart.proceedToCheckout": "Proceed to Checkout",
    "cart.shippingCost": "Delivery Cost",
    "cart.tax": "VAT",
    "cart.discount": "Discount",
    "cart.couponCode": "Voucher Code",
    "cart.applyCoupon": "Apply Voucher",

    // Footer
    "footer.customerService": "Customer Service",
    "footer.quickLinks": "Quick Links",
    "footer.followUs": "Follow Us",
    "footer.newsletter": "Newsletter",
    "footer.subscribeNewsletter": "Subscribe to our newsletter",
    "footer.enterEmail": "Enter your email",
    "footer.subscribe": "Subscribe",
    "footer.copyright": "© 2024 Arnova. All rights reserved.",

    // Messages
    "message.itemAddedToCart": "Item added to basket",
    "message.itemRemovedFromCart": "Item removed from basket",
    "message.itemSaved": "Item saved to favourites",
    "message.itemUnsaved": "Item removed from favourites",
    "message.orderPlaced": "Order placed successfully",
    "message.profileUpdated": "Profile updated successfully",
    "message.passwordChanged": "Password changed successfully",
  },
  sw: {
    // Navigation
    "nav.home": "Nyumbani",
    "nav.newArrivals": "Bidhaa Mpya",
    "nav.clothing": "Nguo",
    "nav.shoes": "Viatu",
    "nav.bags": "Mifuko",
    "nav.accessories": "Vifaa",
    "nav.sale": "Uuzaji",
    "nav.saved": "Zilizohifadhiwa",
    "nav.cart": "Kikapu",
    "nav.profile": "Wasifu",
    "nav.admin": "Msimamizi",
    "nav.about": "Kuhusu",
    "nav.contact": "Mawasiliano",
    "nav.faq": "Maswali Yanayoulizwa Mara Kwa Mara",
    "nav.careers": "Ajira",
    "nav.shipping": "Usafirishaji",
    "nav.returns": "Kurejesha",
    "nav.privacy": "Faragha",
    "nav.terms": "Masharti",
    "nav.cookies": "Vidakuzi",
    "nav.sizeGuide": "Mwongozo wa Ukubwa",

    // Authentication
    "auth.login": "Ingia",
    "auth.signup": "Jisajili",
    "auth.logout": "Toka",
    "auth.register": "Sajili",
    "auth.email": "Barua Pepe",
    "auth.password": "Nenosiri",
    "auth.confirmPassword": "Thibitisha Nenosiri",
    "auth.forgotPassword": "Umesahau Nenosiri?",
    "auth.rememberMe": "Nikumbuke",

    // Common
    "common.search": "Tafuta",
    "common.filter": "Chuja",
    "common.sort": "Panga",
    "common.addToCart": "Ongeza kwenye Kikapu",
    "common.addToSaved": "Hifadhi",
    "common.price": "Bei",
    "common.currency": "Sarafu",
    "common.language": "Lugha",
    "common.loading": "Inapakia",
    "common.error": "Hitilafu",
    "common.success": "Mafanikio",
    "common.cancel": "Ghairi",
    "common.confirm": "Thibitisha",
    "common.save": "Hifadhi",
    "common.edit": "Hariri",
    "common.delete": "Futa",
    "common.view": "Ona",
    "common.close": "Funga",
    "common.next": "Ifuatayo",
    "common.previous": "Iliyotangulia",
    "common.submit": "Wasilisha",
    "common.reset": "Weka Upya",
    "common.clear": "Futa",
    "common.apply": "Tumia",
    "common.remove": "Ondoa",
    "common.update": "Sasisha",
    "common.create": "Unda",
    "common.total": "Jumla",
    "common.subtotal": "Jumla Ndogo",
    "common.quantity": "Idadi",
    "common.size": "Ukubwa",
    "common.color": "Rangi",
    "common.brand": "Chapa",
    "common.category": "Jamii",
    "common.description": "Maelezo",
    "common.reviews": "Mapitio",
    "common.rating": "Kiwango",
    "common.availability": "Upatikanaji",
    "common.inStock": "Ipo Hifadhini",
    "common.outOfStock": "Haipo Hifadhini",

    // Pages
    "page.checkout": "Malipo",
    "page.orderSummary": "Muhtasari wa Agizo",
    "page.paymentMethod": "Njia ya Malipo",
    "page.shippingAddress": "Anwani ya Usafirishaji",
    "page.billingAddress": "Anwani ya Bili",
    "page.orderHistory": "Historia ya Maagizo",
    "page.wishlist": "Orodha ya Matakwa",
    "page.accountSettings": "Mipangilio ya Akaunti",
    "page.personalInfo": "Taarifa za Kibinafsi",
    "page.changePassword": "Badilisha Nenosiri",
    "page.notifications": "Arifa",
    "page.preferences": "Mapendeleo",

    // Admin
    "admin.dashboard": "Dashibodi",
    "admin.products": "Bidhaa",
    "admin.orders": "Maagizo",
    "admin.users": "Watumiaji",
    "admin.analytics": "Uchanganuzi",
    "admin.settings": "Mipangilio",
    "admin.reports": "Ripoti",
    "admin.inventory": "Hifadhi",
    "admin.customers": "Wateja",
    "admin.sales": "Mauzo",

    // Product
    "product.details": "Maelezo ya Bidhaa",
    "product.specifications": "Vipimo",
    "product.shipping": "Taarifa za Usafirishaji",
    "product.returns": "Sera ya Kurejesha",
    "product.relatedItems": "Bidhaa Zinazohusiana",
    "product.customerReviews": "Mapitio ya Wateja",
    "product.writeReview": "Andika Pitio",
    "product.addToWishlist": "Ongeza kwenye Orodha ya Matakwa",
    "product.shareProduct": "Shiriki Bidhaa",
    "product.compareProducts": "Linganisha Bidhaa",

    // Cart & Checkout
    "cart.empty": "Kikapu chako ni tupu",
    "cart.continueShopping": "Endelea Kununua",
    "cart.proceedToCheckout": "Endelea na Malipo",
    "cart.shippingCost": "Gharama ya Usafirishaji",
    "cart.tax": "Kodi",
    "cart.discount": "Punguzo",
    "cart.couponCode": "Msimbo wa Kuponi",
    "cart.applyCoupon": "Tumia Kuponi",

    // Footer
    "footer.customerService": "Huduma kwa Wateja",
    "footer.quickLinks": "Viungo vya Haraka",
    "footer.followUs": "Tufuate",
    "footer.newsletter": "Jarida",
    "footer.subscribeNewsletter": "Jiandikishe kwa jarida letu",
    "footer.enterEmail": "Ingiza barua pepe yako",
    "footer.subscribe": "Jiandikishe",
    "footer.copyright": "© 2024 Arnova. Haki zote zimehifadhiwa.",

    // Messages
    "message.itemAddedToCart": "Bidhaa imeongezwa kwenye kikapu",
    "message.itemRemovedFromCart": "Bidhaa imeondolewa kutoka kikapa",
    "message.itemSaved": "Bidhaa imehifadhiwa kwenye orodha ya matakwa",
    "message.itemUnsaved": "Bidhaa imeondolewa kutoka orodha ya matakwa",
    "message.orderPlaced": "Agizo limewekwa kwa mafanikio",
    "message.profileUpdated": "Wasifu umesasishwa kwa mafanikio",
    "message.passwordChanged": "Nenosiri limebadilishwa kwa mafanikio",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en-US")

  useEffect(() => {
    const stored = localStorage.getItem("arnova-language") as Language
    if (stored && ["en-US", "en-GB", "sw"].includes(stored)) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("arnova-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
