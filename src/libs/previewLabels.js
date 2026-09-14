// 本機預覽專用：因預覽頁不掛載 i18n 插件，這裡用純物件對照 prodv2_common_* langKey 對應的繁中文案，
// 讓 getSidemenu() 產生的側欄資料可以直接顯示文字。僅覆蓋預覽會用到的 key。
const PREVIEW_LABELS = {
	prodv2_common_prod_info: '商品資訊',
	prodv2_common_basic_info: '商品名稱',
	prodv2_common_imgs_and_highlights: '商品亮點',
	prodv2_common_pkg_setting: '方案設定',
	prodv2_common_pkg_schedule: '行程管理',
	prodv2_common_pkg_features: '方案特色',
	prodv2_common_sale_date_and_price: '銷售日期與價格',
	prodv2_common_sale_day_setting: '銷售日設定',
	prodv2_common_price_setting: '價格設定',
	prodv2_common_sales_setting: '銷售設定',
	prodv2_common_order_processing: '訂單處理',
	prodv2_common_voucher_setting: '憑證設定',
	prodv2_common_cancel_setting: '取消設定',
	prodv2_common_market_setting: '銷售市場設定',
	prodv2_common_description: '商品描述',
	prodv2_common_location_setting: '地點設定',
	prodv2_common_traveler_order_info: '旅客訂購資訊',
};

export const previewTransl = key => PREVIEW_LABELS[key] || key;

export default PREVIEW_LABELS;
