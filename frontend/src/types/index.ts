export interface Product {
    id: number | string;
    name?: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    price?: number;
    price_lyd?: number;
    stock?: number;
    stock_quantity?: number;
    imageUrl?: string;
    main_image_url?: string;
    is_frozen?: boolean;
    isFrozen?: boolean;
    is_active?: boolean;
}
