import type { Messages } from './en'

export const ar: Messages = {
  app: {
    name: 'فوكس بي تي',
  },
  nav: {
    today: 'اليوم',
    clients: 'العملاء',
    programs: 'البرامج',
    profile: 'الملف الشخصي',
    train: 'التمرين',
    history: 'السجل',
  },
  auth: {
    signInTitle: 'تسجيل الدخول',
    signUpTitle: 'أنشئ حساب المدرب',
    name: 'الاسم الكامل',
    namePlaceholder: 'مثال: سارة أحمد',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'مثال: sara@example.com',
    password: 'كلمة المرور',
    passwordHint: 'ثمانية أحرف على الأقل.',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء الحساب',
    noAccount: 'مدرب جديد؟',
    haveAccount: 'لديك حساب؟',
    toSignUp: 'أنشئ حسابًا',
    toSignIn: 'سجّل الدخول',
    signInFailed: 'البريد الإلكتروني وكلمة المرور غير متطابقين. حاول مرة أخرى.',
    signUpFailed: 'تعذّر إنشاء الحساب. تحقّق من البيانات وحاول مرة أخرى.',
    quickTitle: 'دخول بيئة التطوير',
    quickTrainer: 'المتابعة كمدرب',
    quickClient: 'المتابعة كعميل',
  },
  today: {
    trainerEmpty: 'لا توجد جلسات محجوزة اليوم.',
    clientEmpty: 'لا يوجد شيء مجدول اليوم.',
    addClient: 'أضف عميلًا',
  },
  clients: {
    empty: 'لا يوجد عملاء بعد.',
    add: 'أضف عميلًا',
  },
  programs: {
    empty: 'لا توجد برامج بعد.',
    create: 'أنشئ برنامجًا',
  },
  train: {
    empty: 'لم يُسند إليك تمرين بعد.',
  },
  history: {
    empty: 'لا توجد جلسات مسجّلة بعد.',
  },
  profile: {
    title: 'الملف الشخصي',
    role: {
      trainer: 'مدرب',
      client: 'عميل',
      admin: 'مسؤول',
    },
    language: 'اللغة',
    theme: 'المظهر',
    themeSystem: 'مطابقة الجهاز',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    signOut: 'تسجيل الخروج',
  },
  common: {
    comingNext: 'هذا الجزء يُبنى في الخطوة التالية.',
  },
}
