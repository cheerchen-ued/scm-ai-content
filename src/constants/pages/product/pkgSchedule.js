export const SCHEDULE_TYPES = {
	STANDALONE_TRIP: 'STANDALONE_TRIP',
	SHUTTLE_COLLECTION: 'SHUTTLE_COLLECTION',
};

export const SCHEDULE_CATEGORIES = {
	LOCATION_SCHEDULE: 'LOCATION_SCHEDULE',
	DESCRIPTION_SCHEDULE: 'DESCRIPTION_SCHEDULE',
};

export const DAILY_MEALS = {
	BREAKFAST: 'BREAKFAST',
	LUNCH: 'LUNCH',
	DINNER: 'DINNER',
	LUNCHBOX: 'BOXED_MEAL',
	AFTERNOON_TEA: 'AFTERNOON_TEA',
	SNACK: 'SNACK',
};

// 地點模組名稱(體驗地點/集合接駁地點/兌換地點)
export const LOCATION = {
	EXPERIENCE: 'EXPERIENCE_LOCATION',
	MEETING_TRANSFER: 'MEETING_AND_SHUTTLE_LOCATION',
	EXCHANGE: 'REDEMPTION_LOCATION',
};

export const LOCATION_LABEL_KEY = {
	[LOCATION.EXPERIENCE]: 'prodv2_common_experience_location',
	[LOCATION.MEETING_TRANSFER]: 'prodv2_common_meeting_transfer_location',
	[LOCATION.EXCHANGE]: 'prodv2_common_exchange_location',
};

export const LOCATION_VALIDATION_RULE_MAPPING = {
	[LOCATION.EXPERIENCE]: 'experienceLocationModule',
	[LOCATION.MEETING_TRANSFER]: 'meetingAndShuttleLocationModule',
	[LOCATION.EXCHANGE]: 'redemptionLocationModule',
	TOTAL_DURATION: 'schedule',
};

// 所有地點的類別(體驗/集合/接駁/兌換/領取/租車/領取與歸還)
export const LOCATION_TYPES = {
	EXPERIENCE: 'EXPERIENCE_LOCATION',
	MEETING: 'MEETING_LOCATION',
	SHUTTLE: 'SHUTTLE_LOCATION',
	REDEMPTION: 'REDEMPTION_LOCATION',
	PICKUP: 'PICKUP_LOCATION',
	CAR_RENTAL: 'CAR_RENTAL_LOCATION',
	PICKUP_AND_RETURN: 'PICK_AND_RETURN_LOCATION',
};

export const LOCATION_TYPE_MAPPING = {
	[LOCATION.MEETING_TRANSFER]: [
		{
			labelKey: 'prodv2_common_meeting_location',
			value: LOCATION_TYPES.MEETING,
		},
		{
			labelKey: 'prodv2_common_transfer_location',
			value: LOCATION_TYPES.SHUTTLE,
		},
	],
	[LOCATION.EXCHANGE]: [
		{
			labelKey: 'prodv2_common_exchange_location',
			value: LOCATION_TYPES.REDEMPTION,
		},
		{
			labelKey: 'prodv2_common_pickup_location',
			value: LOCATION_TYPES.PICKUP,
		},
		{
			labelKey: 'prodv2_common_rental_car_location',
			value: LOCATION_TYPES.CAR_RENTAL,
		},
		{
			labelKey: 'prodv2_common_pickup_and_return_location',
			value: LOCATION_TYPES.PICKUP_AND_RETURN,
		},
	],
};

// 集合/接駁模組 地點標題（對應後端 meetingAndShuttleLocation.title）
export const MEETING_AND_SHUTTLE_TITLE = {
	MEETING: 'MEETING_LOCATION',
	SHUTTLE: 'SHUTTLE_LOCATION',
	PASSENGER_SPECIFIED_SHUTTLE: 'PASSENGER_SPECIFIED_SHUTTLE_LOCATION',
};

// 集合/接駁模組 時間模式（對應後端 timeMode）
export const SHUTTLE_TIME_MODE = {
	FIXED: 'FIXED',
	NOTIFY_AFTER_ORDER: 'NOTIFY_AFTER_ORDER',
};

// 集合/接駁模組 接駁地點的地點指定方式
export const SHUTTLE_LOCATION_ASSIGN_TYPES = {
	SUPPLIER_ASSIGNED: 'SUPPLIER_ASSIGNED',
	TRAVELER_ASSIGNED: 'TRAVELER_ASSIGNED',
};

// 集合/接駁模組 接駁時間設定方式
export const SHUTTLE_TIME_TYPES = {
	SINGLE_TIME: 'SINGLE_TIME',
	TIME_RANGE: 'TIME_RANGE',
	NOTIFY_AFTER_BOOKING: 'NOTIFY_AFTER_BOOKING',
};

export const WEEK = {
	MON: 'MON',
	TUE: 'TUE',
	WED: 'WED',
	THU: 'THU',
	FRI: 'FRI',
	SAT: 'SAT',
	SUN: 'SUN',
};

export const WEEKS = [
	{
		labelKey: 'prodv2_common_monday',
		value: WEEK.MON,
	},
	{
		labelKey: 'prodv2_common_tuesday',
		value: WEEK.TUE,
	},
	{
		labelKey: 'prodv2_common_wednesday',
		value: WEEK.WED,
	},
	{
		labelKey: 'prodv2_common_thursday',
		value: WEEK.THU,
	},
	{
		labelKey: 'prodv2_common_friday',
		value: WEEK.FRI,
	},
	{
		labelKey: 'prodv2_common_saturday',
		value: WEEK.SAT,
	},
	{
		labelKey: 'prodv2_common_sunday',
		value: WEEK.SUN,
	},
];

export const INPUT_MAX = {
	PICKUP_METHOD: 2000,
	RETURN_METHOD: 2000,
	SERVICE_HOURS: 2000,
	ARRIVE_DESC: 2000,
};

export const RETURN_SETTING_OPTIONS = {
	NONE: 'NONE',
	PICKUP_AND_RETURN: 'PICKUP_AND_RETURN',
	PICKUP_ONLY: 'PICKUP_ONLY',
};
