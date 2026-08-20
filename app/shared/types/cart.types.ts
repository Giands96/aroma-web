export interface CartItem {
  optionId: string;
  productId: string;
  productName: string;
  optionName: string;
  unitsPerOption: number;
  optionPrice: number;
  quantity: number;
}

export interface CartLimits {
  id: string;
  max_items: number;
  max_quantity_per_item: number;
}
