"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@/lib/translations";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, Loader2, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { t, dir, isRtl } = useTranslation();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const client = authClient as any;
            let res: any;

            if (typeof client.requestPasswordReset === "function") {
                res = await client.requestPasswordReset({
                    email: email.trim(),
                    redirectTo: "/auth/reset-password",
                });
            } else if (typeof client.forgetPassword === "function") {
                res = await client.forgetPassword({
                    email: email.trim(),
                    redirectTo: "/auth/reset-password",
                });
            } else {
                // Fallback direct endpoint call
                const response = await fetch("/api/auth/request-password-reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim(), redirectTo: "/auth/reset-password" }),
                });
                const body = await response.json().catch(() => ({}));
                if (!response.ok) {
                    res = { error: { message: body.message || "فشل إرسال الرابط" } };
                } else {
                    res = { data: body };
                }
            }

            if (res?.error) {
                toast({
                    title: t("authFailed"),
                    description: res.error.message || "حدث خطأ أثناء إرسال الرابط",
                    variant: "destructive",
                });
                return;
            }

            setIsSubmitted(true);
            toast({
                title: t("resetLinkSent"),
                description: email,
                variant: "success",
            });
        } catch (err: any) {
            toast({
                title: t("authFailed"),
                description: err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 transition-colors duration-300" dir={dir}>
            <Card className="w-full max-w-md shadow-2xl border-border/80 bg-card/90 backdrop-blur-xl text-foreground rounded-3xl p-2 sm:p-4">
                <CardHeader className="space-y-2 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {t("forgotPasswordTitle")}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                        {t("forgotPasswordDesc")}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {isSubmitted ? (
                        <div className="space-y-5 text-center py-4 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                                📬 {t("resetLinkSent")}
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setIsSubmitted(false)}
                                className="w-full text-xs rounded-xl"
                            >
                                إرسال لبريد إلكتروني آخر
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-foreground/80 block">
                                    {t("emailLabel")}
                                </label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="h-11 rounded-xl bg-background/50 border-input text-foreground px-3 text-start"
                                        dir="ltr"
                                    />
                                    <Mail className="absolute end-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t("sending")}</span>
                                    </>
                                ) : (
                                    <span>{t("sendResetLink")}</span>
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
        </div>
    );
}
