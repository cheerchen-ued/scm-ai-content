export const getSidemenu = isTourProduct => {
	const sidemenu = [
		{
			title: 'prodv2_common_prod_info',
			children: [
				{
					id: 'productBasicInfo',
					title: 'prodv2_common_basic_info',
					mpEventName: 'Prodv2_Nav_BasicInfo_Clicked',
				},
				{
					id: 'productHighlight',
					title: 'prodv2_common_imgs_and_highlights',
					mpEventName: 'Prodv2_Nav_ImgAndHighlight_Clicked',
				},
			],
		},
		{
			title: 'prodv2_common_pkg_setting',
			children: [
				{
					id: 'productPkgSetting',
					title: 'prodv2_common_pkg_setting',
					mpEventName: 'Prodv2_Nav_PkgSetting_Clicked',
				},
				...(isTourProduct ? [{
					id: 'productPkgSchedule',
					title: 'prodv2_common_pkg_schedule',
					mpEventName: 'Prodv2_Nav_PkgSchedule_Clicked',
				}] : []),
				{
					id: 'productPkgFeatures',
					title: 'prodv2_common_pkg_features',
					mpEventName: 'Prodv2_Nav_PkgHighlight_Clicked',
				},
			],
		},
		{
			title: 'prodv2_common_sale_date_and_price',
			children: [
				{
					id: 'productSaleDate',
					title: 'prodv2_common_sale_day_setting',
					mpEventName: 'Prodv2_Nav_SalesDate_Clicked',
				},
				{
					id: 'productPrice',
					title: 'prodv2_common_price_setting',
					mpEventName: 'Prodv2_Nav_PriceSetting_Clicked',
				},
			],
		},
		{
			title: 'prodv2_common_sales_setting',
			children: [
				{
					id: 'productOrderProcessing',
					title: 'prodv2_common_order_processing',
					mpEventName: 'Prodv2_Nav_OrderProcessing_Clicked',
				},
				{
					id: 'productVoucher',
					title: 'prodv2_common_voucher_setting',
					mpEventName: 'Prodv2_Nav_VoucherSetting_Clicked',
				},
				{
					id: 'productCancel',
					title: 'prodv2_common_cancel_setting',
					mpEventName: 'Prodv2_Nav_CancellationSetting_Clicked',
				},
				{
					id: 'productMarket',
					title: 'prodv2_common_market_setting',
					mpEventName: 'Prodv2_Nav_MarketSetting_Clicked',
				},
			],
		},
		{
			title: 'prodv2_common_description',
			children: [
				{
					id: 'productDescription',
					title: 'prodv2_common_description',
					mpEventName: 'Prodv2_Nav_ProductDesc_Clicked',
				},
				{
					id: 'productLocation',
					title: 'prodv2_common_location_setting',
					mpEventName: 'Prodv2_Nav_LocationSetting_Clicked',
				},
			],
		},
		{
			id: 'productTravelerOrderInfo',
			title: 'prodv2_common_traveler_order_info',
			mpEventName: 'Prodv2_Nav_TravelerInfo_Clicked',
		},
	];

	return sidemenu;
};

export const getSteps = sidemenu => {
	const steps = {};
	let prevStep = null;

	for (let i = 0; i < sidemenu.length; i += 1) {
		const menu = sidemenu[i];

		if (menu.id) {
			steps[menu.id] = {
				step: i,
				title: menu.title,
				prevStep,
			};
			prevStep = menu.id;
		}

		if (menu.children) {
			for (let j = 0; j < menu.children.length; j += 1) {
				const submenu = menu.children[j];

				if (submenu.id) {
					steps[submenu.id] = {
						step: i,
						title: submenu.title,
						prevStep,
					};
					prevStep = submenu.id;
				}
			}
		}
	}

	return steps;
};

const sidemenu = [
	{
		title: 'prodv2_common_prod_info',
		children: [
			{
				id: 'productBasicInfo',
				title: 'prodv2_common_basic_info',
				mpEventName: 'Prodv2_Nav_BasicInfo_Clicked',
			},
			{
				id: 'productHighlight',
				title: 'prodv2_common_imgs_and_highlights',
				mpEventName: 'Prodv2_Nav_ImgAndHighlight_Clicked',
			},
		],
	},
	{
		title: 'prodv2_common_pkg_setting',
		children: [
			{
				id: 'productPkgSetting',
				title: 'prodv2_common_pkg_setting',
				mpEventName: 'Prodv2_Nav_PkgSetting_Clicked',
			},
			{
				id: 'productPkgFeatures',
				title: 'prodv2_common_pkg_features',
				mpEventName: 'Prodv2_Nav_PkgHighlight_Clicked',
			},
		],
	},
	{
		title: 'prodv2_common_sale_date_and_price',
		children: [
			{
				id: 'productSaleDate',
				title: 'prodv2_common_sale_day_setting',
				mpEventName: 'Prodv2_Nav_SalesDate_Clicked',
			},
			{
				id: 'productPrice',
				title: 'prodv2_common_price_setting',
				mpEventName: 'Prodv2_Nav_PriceSetting_Clicked',
			},
		],
	},
	{
		title: 'prodv2_common_sales_setting',
		children: [
			{
				id: 'productOrderProcessing',
				title: 'prodv2_common_order_processing',
				mpEventName: 'Prodv2_Nav_OrderProcessing_Clicked',
			},
			{
				id: 'productVoucher',
				title: 'prodv2_common_voucher_setting',
				mpEventName: 'Prodv2_Nav_VoucherSetting_Clicked',
			},
			{
				id: 'productCancel',
				title: 'prodv2_common_cancel_setting',
				mpEventName: 'Prodv2_Nav_CancellationSetting_Clicked',
			},
			{
				id: 'productMarket',
				title: 'prodv2_common_market_setting',
				mpEventName: 'Prodv2_Nav_MarketSetting_Clicked',
			},
		],
	},
	{
		title: 'prodv2_common_description',
		children: [
			{
				id: 'productDescription',
				title: 'prodv2_common_description',
				mpEventName: 'Prodv2_Nav_ProductDesc_Clicked',
			},
			{
				id: 'productLocation',
				title: 'prodv2_common_location_setting',
				mpEventName: 'Prodv2_Nav_LocationSetting_Clicked',
			},
		],
	},
	{
		id: 'productTravelerOrderInfo',
		title: 'prodv2_common_traveler_order_info',
		mpEventName: 'Prodv2_Nav_TravelerInfo_Clicked',
	},
];

const steps = {};
let prevStep = null;

for (let i = 0; i < sidemenu.length; i += 1) {
	const menu = sidemenu[i];

	if (menu.id) {
		steps[menu.id] = {
			step: i,
			title: menu.title,
			prevStep,
		};
		prevStep = menu.id;
	}

	if (menu.children) {
		for (let j = 0; j < menu.children.length; j += 1) {
			const submenu = menu.children[j];

			if (submenu.id) {
				steps[submenu.id] = {
					step: i,
					title: submenu.title,
					prevStep,
				};
				prevStep = submenu.id;
			}
		}
	}
}

export {sidemenu, steps};
