"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { getUserRole, getToken } from "@/lib/auth";
import { getClientApiUrl } from "@/lib/config";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/translations";
import { Upload, X, Loader2, PlusCircle } from "lucide-react";

export function AddProductModal() {
    const router = useRouter();
    const { toast } = useToast();
    const { t, dir } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [showUrlInput, setShowUrlInput] = useState(false);

    useEffect(() => {
        setRole(getUserRole());
    }, []);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
        isFrozen: false,
    });

    if (role !== 'admin') {
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isFrozen: checked }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const token = getToken();
        if (!token) {
            toast({
                title: t("unauthorized"),
                description: t("unauthorizedDesc"),
                variant: "destructive",
            });
            router.push("/auth/login");
            return;
        }

        setUploading(true);
        try {
            const fileData = new FormData();
            fileData.append("file", file);

            const res = await apiFetch("/products/upload", {
                method: "POST",
                body: fileData,
            });

            if (res.status === 401) {
                toast({
                    title: t("unauthorized"),
                    description: t("unauthorizedDesc"),
                    variant: "destructive",
                });
                router.push("/auth/login");
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to upload image");
            }

            const data = await res.json();
            const finalUrl = data.imageUrl || data.path || data.fileUrl || data.url;
            setFormData((prev) => ({ ...prev, imageUrl: finalUrl }));

            toast({
                title: t("uploadSuccess"),
                description: t("uploadSuccessDesc"),
                variant: "success",
            });
        } catch (error: any) {
            console.error("Error uploading image:", error);
            toast({
                title: t("uploadFailed"),
                description: error.message || "Error uploading image",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({ ...prev, imageUrl: "" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiFetch("/products", {
                method: "POST",
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    imageUrl: formData.imageUrl,
                    isFrozen: formData.isFrozen,
                }),
            });

            if (res.status === 401) {
                toast({
                    title: t("unauthorized"),
                    description: t("unauthorizedDesc"),
                    variant: "destructive",
                });
                router.push("/auth/login");
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to create product");
            }

            toast({
                title: t("productAdded"),
                description: t("productAddedDesc", { name: formData.name }),
                variant: "success",
            });
            setOpen(false);
            setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                imageUrl: "",
                isFrozen: false,
            });
            setShowUrlInput(false);
            router.refresh();
        } catch (error: any) {
            toast({
                title: t("productAddFailed"),
                description: error.message || "Failed to add product",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Resolve URL for display
    const displayImageUrl = formData.imageUrl
        ? formData.imageUrl.startsWith("/")
            ? `${getClientApiUrl()}${formData.imageUrl}`
            : formData.imageUrl
        : "";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:scale-105 transition-all text-sm">
                    <PlusCircle className="w-4 h-4" />
                    <span>{t("addProduct")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto border border-border/50 bg-card/95 backdrop-blur-md text-foreground" dir={dir}>
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{t("addNewProduct")}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t("createProductDesc")}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-start">
                                {t("nameLabel")}
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="col-span-3 bg-background/50 border-border text-foreground"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-start">
                                {t("descriptionLabel")}
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="col-span-3 bg-background/50 border-border text-foreground"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-start">
                                {t("priceLabel")}
                            </Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                className="col-span-3 bg-background/50 border-border text-foreground"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-start">
                                {t("stockLabel")}
                            </Label>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                value={formData.stock}
                                onChange={handleChange}
                                className="col-span-3 bg-background/50 border-border text-foreground"
                                required
                            />
                        </div>

                        {/* Image picker */}
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-start pt-2">
                                {t("imageLabel")}
                            </Label>
                            <div className="col-span-3 space-y-3">
                                {formData.imageUrl ? (
                                    <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center group">
                                        <img
                                            src={displayImageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer bg-background/30 hover:bg-background/50 transition-all">
                                        {uploading ? (
                                             <div className="flex flex-col items-center space-y-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <span className="text-sm text-muted-foreground">{t("uploading")}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-1">
                                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                                <p className="text-sm font-medium">{t("chooseImage")}</p>
                                                <p className="text-xs text-muted-foreground">{t("pngJpgWebp")}</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            disabled={uploading}
                                        />
                                    </label>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowUrlInput(!showUrlInput)}
                                    className="text-xs text-primary hover:underline block"
                                >
                                    {showUrlInput ? t("hideUrlInput") : t("showUrlInput")}
                                </button>

                                {showUrlInput && (
                                    <Input
                                        id="imageUrl"
                                        name="imageUrl"
                                        type="url"
                                        placeholder={t("imageUrlPlaceholder")}
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="bg-background/50 border-border text-foreground"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="isFrozen" className="text-start">
                                {t("isFrozenLabel")}
                            </Label>
                            <Checkbox
                                id="isFrozen"
                                checked={formData.isFrozen}
                                onCheckedChange={handleCheckboxChange}
                                className="col-span-3 border-border"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="submit" disabled={loading || uploading}>
                            {loading ? t("saving") : t("saveChanges")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
