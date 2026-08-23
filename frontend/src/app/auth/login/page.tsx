"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/config";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { setToken } from "@/lib/auth";
import { useTranslation } from "@/lib/translations";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { t, dir } = useTranslation();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const apiUrl = getApiUrl();
            const cleanUrl = apiUrl.replace(/\/+$/, '');
            const loginEndpoint = cleanUrl.endsWith('/api') 
                ? `${cleanUrl}/auth/login` 
                : `${cleanUrl}/api/auth/login`;

            const res = await fetch(loginEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Bypass-Tunnel-Reminder": "true",
                },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const responseData = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(responseData.message || "فشل تسجيل الدخول، تأكد من صحة البريد وكلمة المرور");
            }

            const token = responseData.accessToken || responseData.token;
            if (token) {
                setToken(token);
            }

            toast({
                title: t("authSuccess"),
                description: t("authSuccessDesc"),
                variant: "success",
            });
            router.push("/");
            router.refresh();
        } catch (err: any) {
            console.error("Login error:", err);
            const msg = err.message === "Failed to fetch"
                ? "تعذر الاتصال ببوابة الخوادم (تأكد من تشغيل نفق Cloudflare أو رابط الـ API)"
                : err.message;
            setError(msg);
            toast({
                title: t("authFailed"),
                description: msg,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4" dir={dir}>
            <Card className="w-full max-w-md shadow-2xl border-border bg-card text-foreground">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-3xl font-extrabold tracking-tight">{t("loginTitle")}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t("loginDesc")}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground">
                                {t("emailLabel")}
                            </label>
                            <input
                                type="email"
                                placeholder="admin@admin.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-muted-foreground">
                                    {t("passwordLabel")}
                                </label>
                                <Link 
                                    href="/auth/forgot-password" 
                                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                                >
                                    {t("forgotPasswordLink")}
                                </Link>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold" disabled={loading}>
                            {loading ? t("signingIn") : t("signIn")}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-muted-foreground">
                        {t("noAccount")}{" "}
                        <Link href="/auth/register" className="underline underline-offset-4 hover:text-emerald-500 font-bold transition-all">
                            {t("registerNow")}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
