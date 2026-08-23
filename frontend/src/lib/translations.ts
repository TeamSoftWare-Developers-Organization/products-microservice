import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export const translations = {
  ar: {
    // Header
    brandName: 'MicroStore',
    brandDesc: 'منصة التجارة الإلكترونية المعززة بالحاويات والخدمات المصغرة',
    navHome: 'الرئيسية',
    navPermissions: 'إدارة الصلاحيات (RBAC)',
    navLogistics: 'اللوجستيات والمخازن',
    navFinance: 'المالية والخزينة',
    cart: 'السلة',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    newBadge: 'جديد',

    // Home
    addProduct: 'إضافة منتج',
    noProducts: 'لم يتم العثور على منتجات',
    storeOffline: 'المتجر فارغ حالياً أو أن الخدمات الخلفية غير متصلة.',
    catalogTitle: 'المنتجات المتاحة',
    catalogSubtitle: 'تصفح أحدث الأجهزة والمنتجات المتوفرة في المتجر',
    totalProducts: 'إجمالي المنتجات',

    // Product Card
    buyNow: 'شراء الآن',
    processing: 'جاري المعالجة...',
    stock: 'المخزون',
    outOfStock: 'نفذ من المخزن',
    orderPlaced: 'تم تقديم الطلب ✅',
    orderPlacedDesc: 'تم طلب وحدة واحدة من "{name}" بنجاح.',
    orderFailed: 'فشل الطلب ❌',

    // Add Product Modal
    addNewProduct: 'إضافة منتج جديد',
    createProductDesc: 'قم بإنشاء منتج جديد هنا. اضغط على حفظ عند الانتهاء.',
    nameLabel: 'الاسم (بالعربية)',
    descriptionLabel: 'الوصف',
    priceLabel: 'السعر (د.ل)',
    stockLabel: 'الكمية في المخزن',
    imageLabel: 'الصورة',
    chooseImage: 'اختر صورة المنتج',
    pngJpgWebp: 'PNG, JPG أو WEBP',
    hideUrlInput: 'إخفاء حقل رابط الصورة',
    showUrlInput: 'أو أدخل رابط الصورة مباشرة',
    imageUrlPlaceholder: 'https://example.com/image.jpg',
    isFrozenLabel: 'هل المنتج مجمد؟',
    saveChanges: 'حفظ التغييرات',
    saving: 'جاري الحفظ...',
    uploading: 'جاري الرفع...',
    uploadSuccess: 'تم رفع الصورة بنجاح ✅',
    uploadSuccessDesc: 'تم حفظ الصورة بنجاح في وحدة التخزين السحابية.',
    uploadFailed: 'فشل رفع الصورة ❌',
    unauthorized: 'غير مصرح',
    unauthorizedDesc: 'جلسة الدخول منتهية، يرجى تسجيل الدخول مجدداً',
    productAdded: 'تم إضافة المنتج ✅',
    productAddedDesc: 'تم إضافة "{name}" بنجاح إلى المتجر.',
    productAddFailed: 'فشل إضافة المنتج ❌',

    // Edit Product Modal
    editProduct: 'تعديل المنتج',
    editProductTitle: 'تعديل بيانات المنتج',
    editProductDesc: 'تعديل تفاصيل المنتج الحالي هنا. اضغط على حفظ عند الانتهاء.',
    productUpdated: 'تم تحديث المنتج ✅',
    productUpdatedDesc: 'تم تحديث "{name}" بنجاح.',
    productUpdateFailed: 'فشل تحديث المنتج ❌',

    // Auth Pages
    loginTitle: 'تسجيل الدخول إلى MicroStore',
    loginDesc: 'ادخل بيانات حسابك للوصول إلى لوحة التحكم والتسوق',
    registerTitle: 'إنشاء حساب جديد',
    registerDesc: 'انضم إلينا اليوم للتمتع بتجربة تسوق متكاملة',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    roleLabel: 'الدور الافتراضي (للتجربة)',
    signingIn: 'جاري الدخول...',
    signingUp: 'جاري التسجيل...',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء الحساب',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    registerNow: 'سجل الآن',
    loginHere: 'سجل الدخول هنا',
    authSuccess: 'مرحباً بك مجدداً 👋',
    authSuccessDesc: 'تم تسجيل الدخول بنجاح.',
    authFailed: 'فشل التوثيق ❌',
    regSuccess: 'تم التسجيل بنجاح 🎉',
    regSuccessDesc: 'يمكنك الآن تسجيل الدخول باستخدام حسابك الجديد.',
    regFailed: 'فشل التسجيل ❌',
    forgotPasswordTitle: 'نسيت كلمة المرور؟',
    forgotPasswordDesc: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيينها.',
    sendResetLink: 'إرسال رابط الاستعادة',
    sending: 'جاري الإرسال...',
    resetLinkSent: 'تم إرسال رابط استعادة كلمة المرور! تفقد بريدك الإلكتروني.',
    resetPasswordTitle: 'تعيين كلمة مرور جديدة',
    resetPasswordDesc: 'أدخل كلمة المرور الجديدة لحسابك للمتابعة.',
    newPasswordLabel: 'كلمة المرور الجديدة',
    confirmPasswordLabel: 'تأكيد كلمة المرور',
    passwordMismatch: 'كلمات المرور غير متطابقة!',
    passwordTooShort: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.',
    saveNewPassword: 'تغيير كلمة المرور',
    savingPassword: 'جاري الحفظ...',
    passwordResetSuccess: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
    backToLogin: 'العودة لتسجيل الدخول',
    forgotPasswordLink: 'نسيت كلمة المرور؟',
  },
  en: {
    // Header
    brandName: 'MicroStore',
    brandDesc: 'Containerized Microservices E-commerce Platform',
    navHome: 'Home',
    navPermissions: 'Permissions (RBAC)',
    navLogistics: 'Logistics & Warehouses',
    navFinance: 'Finance & Treasury',
    cart: 'Cart',
    logout: 'Logout',
    login: 'Login',
    newBadge: 'New',

    // Home
    addProduct: 'Add Product',
    noProducts: 'No products found',
    storeOffline: 'The store is currently empty or the backend is offline.',
    catalogTitle: 'Available Products',
    catalogSubtitle: 'Browse the latest devices and products available in the store',
    totalProducts: 'Total Products',

    // Product Card
    buyNow: 'Buy Now',
    processing: 'Processing...',
    stock: 'Stock',
    outOfStock: 'Out of Stock',
    orderPlaced: 'Order Placed ✅',
    orderPlacedDesc: 'Successfully ordered 1 unit of "{name}".',
    orderFailed: 'Order Failed ❌',

    // Add Product Modal
    addNewProduct: 'Add New Product',
    createProductDesc: 'Create a new product here. Click save when you\'re done.',
    nameLabel: 'Name (Arabic)',
    descriptionLabel: 'Description',
    priceLabel: 'Price (LYD)',
    stockLabel: 'Stock Quantity',
    imageLabel: 'Image',
    chooseImage: 'Choose Product Image',
    pngJpgWebp: 'PNG, JPG or WEBP',
    hideUrlInput: 'Hide image URL input',
    showUrlInput: 'Or enter direct image URL instead',
    imageUrlPlaceholder: 'https://example.com/image.jpg',
    isFrozenLabel: 'Is Frozen?',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    uploading: 'Uploading...',
    uploadSuccess: 'Image Uploaded Successfully ✅',
    uploadSuccessDesc: 'Image has been saved in cloud storage.',
    uploadFailed: 'Image Upload Failed ❌',
    unauthorized: 'Unauthorized',
    unauthorizedDesc: 'Session expired, please log in again',
    productAdded: 'Product Added ✅',
    productAddedDesc: 'Successfully added "{name}" to the store.',
    productAddFailed: 'Failed to add product ❌',

    // Edit Product Modal
    editProduct: 'Edit Product',
    editProductTitle: 'Edit Product Details',
    editProductDesc: 'Edit the details of this product. Click save when you\'re done.',
    productUpdated: 'Product Updated ✅',
    productUpdatedDesc: 'Successfully updated "{name}".',
    productUpdateFailed: 'Failed to update product ❌',

    // Auth Pages
    loginTitle: 'Login to MicroStore',
    loginDesc: 'Enter your credentials to access the store & dashboard',
    registerTitle: 'Create New Account',
    registerDesc: 'Join us today for a complete shopping experience',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    roleLabel: 'Default Role (For Demo)',
    signingIn: 'Signing In...',
    signingUp: 'Signing Up...',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    registerNow: 'Register now',
    loginHere: 'Login here',
    authSuccess: 'Welcome back 👋',
    authSuccessDesc: 'Logged in successfully.',
    authFailed: 'Authentication Failed ❌',
    regSuccess: 'Registration Successful 🎉',
    regSuccessDesc: 'You can now log in with your new account.',
    regFailed: 'Registration Failed ❌',
    forgotPasswordTitle: 'Forgot Password?',
    forgotPasswordDesc: 'Enter your email and we will send you a reset link.',
    sendResetLink: 'Send Reset Link',
    sending: 'Sending...',
    resetLinkSent: 'Password reset link sent! Check your email.',
    resetPasswordTitle: 'Set New Password',
    resetPasswordDesc: 'Enter a new password for your account to continue.',
    newPasswordLabel: 'New Password',
    confirmPasswordLabel: 'Confirm Password',
    passwordMismatch: 'Passwords do not match!',
    passwordTooShort: 'Password must be at least 8 characters.',
    saveNewPassword: 'Save New Password',
    savingPassword: 'Saving...',
    passwordResetSuccess: 'Password changed successfully! You can now log in.',
    backToLogin: 'Back to Login',
    forgotPasswordLink: 'Forgot password?',
  },
};

export type TranslationKey = keyof typeof translations.ar;

export function useTranslation() {
  const language = useSelector((state: RootState) => state.ui.language);
  const theme = useSelector((state: RootState) => state.ui.theme);
  
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const dict = translations[language] || translations.ar;
    let text = dict[key] || translations.ar[key] || String(key);
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return {
    t,
    language,
    theme,
    isRtl: language === 'ar',
    dir: language === 'ar' ? 'rtl' : 'ltr' as 'rtl' | 'ltr',
  };
}
