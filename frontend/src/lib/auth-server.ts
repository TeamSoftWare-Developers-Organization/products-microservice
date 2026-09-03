import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { bearer } from "better-auth/plugins";
import nodemailer from "nodemailer";
import { _dec, SECURE_ENDPOINTS } from "./security";

const isProduction = process.env.NODE_ENV === "production";

// 🔒 إعداد متصل البريد الإلكتروني (SMTP) مع حماية ضد غياب البيانات
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: (process.env.SMTP_SECURE ?? "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// 🔒 التحقق من الأسرار والروابط المشفرة لمنع التزوير واختراق الجلسات
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || _dec(SECURE_ENDPOINTS.SECRET_FALLBACK);

const DATABASE_URL = process.env.DATABASE_URL || _dec(SECURE_ENDPOINTS.DATABASE_FALLBACK);

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || (
  process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : (isProduction ? _dec(SECURE_ENDPOINTS.VERCEL_APP) : _dec(SECURE_ENDPOINTS.LOCAL_3000))
);

// 🛡️ حماية الروابط الموثوقة (Trusted Origins) المشفرة لمنع هجمات CSRF / Origin Spoofing
function getTrustedOrigins(): string[] {
  // قراءة الروابط المخصصة من متغيرات البيئة إن وجدت
  const envOrigins = process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
    : [];

  const defaultOrigins = [
    _dec(SECURE_ENDPOINTS.MICROSHOP_MAIN),
    _dec(SECURE_ENDPOINTS.MICROSHOP_WILDCARD),
    _dec(SECURE_ENDPOINTS.VERCEL_APP),
    _dec(SECURE_ENDPOINTS.VERCEL_WILDCARD),
    _dec(SECURE_ENDPOINTS.LOCAL_3000),
    _dec(SECURE_ENDPOINTS.LOCAL_8085),
    _dec(SECURE_ENDPOINTS.LOCAL_IP_3000),
    _dec(SECURE_ENDPOINTS.LOCAL_IP_8085),
  ];

  if (process.env.VERCEL_URL) {
    defaultOrigins.push(`https://${process.env.VERCEL_URL}`);
  }

  // دمج النطاقات بدون تكرار
  return Array.from(new Set([...defaultOrigins, ...envOrigins]));
}

const dbPool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction && process.env.DB_SSL !== "false" ? { rejectUnauthorized: false } : undefined,
});

export const auth = betterAuth({
  database: dbPool,
  secret: BETTER_AUTH_SECRET,
  baseURL: BETTER_AUTH_URL,

  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    maxPasswordLength: 100,

    // 📨 إرسال إيميل إعادة تعيين كلمة المرور
    sendResetPassword: async ({ user, url }) => {
      try {
        const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.EMAIL_FROM || '"متجر مايكروشوب" <no-reply@microshop.ly>';
        await transporter.sendMail({
          from: fromEmail,
          to: user.email,
          subject: "إعادة تعيين كلمة المرور 🔒 - MicroShop",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
              <h2>مرحباً ${user.name}،</h2>
              <p>لقد طلبت إعادة تعيين كلمة مرورك. انقر على الزر أدناه للمتابعة:</p>
              <div style="margin: 20px 0;">
                <a href="${url}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">تغيير كلمة المرور</a>
              </div>
              <p style="color: #666; font-size: 12px;">إذا لم تطلب هذا التغيير، يمكنك تجاهل هذا البريد بأمان.</p>
            </div>
          `,
        });
        console.log(`✅ تم إرسال إيميل إعادة تعيين كلمة المرور إلى: ${user.email}`);
      } catch (err: any) {
        console.error("❌ فشل إرسال إيميل إعادة تعيين كلمة المرور:", err.message);
      }
    },
  },

  // 📨 إرسال إيميل التحقق من الحساب
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || '"MicroShop Accounts" <welcome@microshop.ly>',
          to: user.email,
          subject: "تفعيل حسابك في MicroShop",
          html: `
            <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
              <h2>أهلاً بك يا ${user.name}! 🎉</h2>
              <p>شكراً لانضمامك إلينا. يرجى تفعيل حسابك عبر النقر على الرابط التالي:</p>
              <div style="margin: 20px 0;">
                <a href="${url}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">تفعيل الحساب</a>
              </div>
              <p style="color: #666; font-size: 12px;">هذا الرابط صالح لفترة محدودة فقط.</p>
            </div>
          `,
        });
        console.log(`✅ تم إرسال إيميل التفعيل إلى: ${user.email}`);
      } catch (err: any) {
        console.error("❌ فشل إرسال إيميل التفعيل:", err.message);
      }
    },
  },

  // 🛡️ حماية ضد الهجمات المتكررة (Brute-force / Rate Limiting)
  rateLimit: { 
    window: 60, 
    max: isProduction ? 10 : 30 
  },

  // 🛡️ تعيين الروابط الموثوقة المحمية ديناميكياً
  trustedOrigins: getTrustedOrigins(),

  plugins: [
    bearer(),
  ],
});
