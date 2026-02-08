export interface Product {
    id: number;
    name_ar: string;
    description_ar: string;
    price_lyd: number;
    stock_quantity: number;
    main_image_url: string;
    is_frozen?: boolean;
}
