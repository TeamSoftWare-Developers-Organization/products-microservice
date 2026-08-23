"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/translations";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t, dir, isRtl } = useTranslation();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // التحقق المبدئي في الواجهة
        if (password !== confirmPassword) {
            toast({
                title: t("passwordMismatch"),
                description: "تأكد من كتابة نفس كلمة المرور في كلا الحقلين",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: t("passwordTooShort"),
                description: "كلمة المرور يجب أن لا تقل عن 8 خانات",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const token = searchParams.get("token") || undefined;
            const client = authClient as any;
            let res: any;

            if (typeof client.resetPassword === "function") {
                res = await client.resetPassword({
                    newPassword: password,
                    token,
                });
            } else {
                // Fallback direct endpoint
                const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newPassword: password, token }),
                });
                const body = await response.json().catch(() => ({}));
                if (!response.ok) {
                    res = { error: { message: body.message || "الرابط غير صالح أو منتهي الصلاحية" } };
                } else {
                    res = { data: body };
                }
            }

            if (res?.error) {
                toast({
                    title: t("authFailed"),
                    description: res.error.message || "الرابط غير صالح أو منتهي الصلاحية.",
                    variant: "destructive",
                });
                return;
            }

            setIsSuccess(true);
            toast({
                title: t("passwordResetSuccess"),
                variant: "success",
            });

            setTimeout(() => {
                router.push("/auth/login");
            }, 2000);
        } catch (err: any) {
            toast({
                title: t("authFailed"),
                description: err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md shadow-2xl border-border/80 bg-card/90 backdrop-blur-xl text-foreground rounded-3xl p-2 sm:p-4">
            <CardHeader className="space-y-2 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                    <Lock className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {t("resetPasswordTitle")}
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                    {t("resetPasswordDesc")}
                </CardDescription>
            </CardHeader>

            <CardContent>
                {isSuccess ? (
                    <div className="space-y-4 text-center py-6 animate-fade-in">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {t("passwordResetSuccess")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            جاري التوجيه إلى صفحة تسجيل الدخول... ⏳
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-semibold text-foreground/80 block">
                                {t("newPasswordLabel")}
                            </label>
                            <Input
                                id="new-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-11 rounded-xl bg-background/50 border-input text-foreground px-3 text-start"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground/80 block">
                                {t("confirmPasswordLabel")}
                            </label>
                            <Input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="h-11 rounded-xl bg-background/50 border-input text-foreground px-3 text-start"
                                dir="ltr"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{t("savingPassword")}</span>
                                </>
                            ) : (
                                <span>{t("saveNewPassword")}</span>
                            )}
                        </Button>
                    </form>
                )}
            </CardContent>

            <CardFooter className="flex justify-center border-t border-border/40 pt-4 mt-2">
                <Link 
                    href="/auth/login" 
                    className="text-xs text-muted-foreground hover:text-emerald-500 font-semibold transition-colors flex items-center gap-1.5"
                >
                    {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    <span>{t("backToLogin")}</span>
                </Link>
            </CardFooter>
        </Card>
    );
}

export default function ResetPasswordPage() {
    const { dir } = useTranslation();

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 transition-colors duration-300" dir={dir}>
            <Suspense fallback={
                <div className="text-center p-8 text-muted-foreground text-sm">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
                    جاري التحميل...
                </div>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
