<template>
	<div>
		<div class="page-card-header">
			行程管理
		</div>
		<div class="plan-list">
			<a-collapse
				v-model:active-key="activePlanKeys"
				class="plan-collapse"
				:bordered="false">
				<a-collapse-panel
					v-for="plan in plans"
					:key="plan.key">
					<template #header>
						<a-tag color="gold">
							{{ plan.statusTag }}
						</a-tag>
						<span class="plan-title">{{ plan.name }}</span>
					</template>
					<div
						v-if="plan.key === plans[0].key"
						class="itinerary-description">
						<div class="intro-block">
							<div class="intro-row">
								<div class="section-title">
									行程介紹
								</div>

								<div
									v-if="aiState === 'idle'"
									class="ai-trigger"
									@click="aiState = 'panelOpen'">
									<svg
										viewBox="0 0 16 16"
										fill="currentColor"
										v-html="icons.sparkle" />
									AI 潤稿
								</div>

								<div
									v-if="aiState === 'panelOpen'"
									class="ai-panel">
									<div class="ai-panel-head">
										<svg
											viewBox="0 0 16 16"
											fill="currentColor"
											v-html="icons.sparkle" />
										生成行程介紹
									</div>
									<div class="ai-panel-body">
										<div class="ai-field-group">
											<label class="ai-field-label"><span class="required">*</span>您的行程表內容為何呢？</label>
											<a-textarea
												v-model:value="aiMaterial"
												class="material-input"
												:rows="2"
												:maxlength="2000"
												show-count
												placeholder="貼上你的行程，時間、地點等越詳細建議越準確" />
										</div>
										<div class="ai-field-group">
											<label class="ai-field-label"><span class="required">*</span>總時長多久？</label>
											<div class="form-option d-flex">
												<a-select
													v-model:value="aiDuration.day"
													placeholder="天數"
													style="width: 160px" />
												<span>天</span>
												<a-select
													v-model:value="aiDuration.hour"
													placeholder="時數"
													style="width: 160px" />
												<span>時</span>
												<a-select
													v-model:value="aiDuration.minute"
													placeholder="分數"
													style="width: 160px" />
												<span>分</span>
											</div>
										</div>
										<div class="ai-disclaimer">
											<exclamation-circle-filled />
											<div class="ai-disclaimer-lines">
												<div>1. 產生內容將取代已填寫的行程內容，請確認地點與內容正確後再產生。</div>
												<div>2. 內容由 AI 生成，僅供參考。請務必確認與實際提供之行程服務相符，如有落差請修改後再使用。</div>
											</div>
										</div>
										<div class="gen-row">
											<div
												v-if="showGeneratingHint"
												class="quota-hint">
												生成中...可先填寫其他欄位，完成後會通知您
											</div>
											<div
												v-else-if="sharedAiQuota"
												class="quota-hint">
												{{ quotaRemaining > 0 ? `今日額度 ${sharedAiQuota.used} / ${sharedAiQuota.limit}` : '今日生成次數已用完，請明天再試' }}
											</div>
											<a-button @click="aiState = 'idle'">
												取消
											</a-button>
											<a-button
												type="primary"
												class="btn-ai"
												:loading="generating"
												:disabled="quotaRemaining === 0"
												@click="generateSchedule">
												產生建議
											</a-button>
										</div>
									</div>
								</div>
							</div>

							<div class="total-duration d-flex align-items-baseline flex-nowrap">
								<div class="form-label">
									<span class="required">*</span>
									總時長：
								</div>
								<div class="form-option d-flex">
									<a-select
										v-model:value="totalDuration.day"
										placeholder="天數"
										:disabled="aiState === 'panelOpen'"
										style="width: 160px" />
									<span>天</span>
									<a-select
										v-model:value="totalDuration.hour"
										placeholder="時數"
										:disabled="aiState === 'panelOpen'"
										style="width: 160px" />
									<span>時</span>
									<a-select
										v-model:value="totalDuration.minute"
										placeholder="分數"
										:disabled="aiState === 'panelOpen'"
										style="width: 160px" />
									<span>分</span>
								</div>
							</div>
							<div
								v-if="days.length"
								class="day-cards d-flex flex-column"
								:class="{ 'ai-fields-disabled': aiState === 'panelOpen' }">
								<div
									v-for="(day, dayIdx) in days"
									:key="day.key"
									class="day-card"
									:class="{ 'just-generated': day.justGenerated }">
									<pkg-sub-card
										:title="`第 ${dayIdx + 1} 天`"
										is-required
										show-sort-btn
										:is-expanded="day.isExpanded"
										:can-sort="days.length > 1"
										@toggle="day.isExpanded = $event">
										<div class="schedule-items">
											<div
												v-for="item in day.schedules"
												:key="item.key"
												class="schedule-item-row">
												<div class="timeline-icon">
													<environment-two-tone />
												</div>
												<activity-card
													:item="item"
													class="schedule-item-card"
													@toggle="item.expanded = !item.expanded"
													@delete="removeItem(day, item)" />
											</div>
										</div>
										<a-button class="add-schedule-btn">
											<template #icon><plus-outlined /></template>
											新增行程
										</a-button>
										<div class="day-meals-row">
											<coffee-outlined class="day-meals-icon" />
											<span class="day-meals-label">當日餐點：</span>
											<a-checkbox-group
												v-model:value="day.meals"
												class="day-meals-options">
												<a-checkbox value="breakfast">
													早餐
												</a-checkbox>
												<a-checkbox value="lunch">
													午餐
												</a-checkbox>
												<a-checkbox value="dinner">
													晚餐
												</a-checkbox>
												<a-checkbox value="boxMeal">
													餐盒
												</a-checkbox>
												<a-checkbox value="afternoonTea">
													下午茶
												</a-checkbox>
												<a-checkbox value="snack">
													點心
												</a-checkbox>
											</a-checkbox-group>
										</div>
									</pkg-sub-card>
								</div>
							</div>
						</div>

						<div class="exchange-block">
							<div class="exchange-location">
								<div class="section-title">
									兌換地點
								</div>
								<div class="exchange-fields-group">
									<div class="exchange-field">
										<label class="ai-sub-label">領取方式說明</label>
										<div class="rte-toolbar">
											<unordered-list-outlined />
											<ordered-list-outlined />
											<link-outlined />
										</div>
										<a-textarea
											v-model:value="exchangeNote"
											class="rte-textarea"
											:auto-size="{ minRows: 3, maxRows: 6 }"
											:maxlength="2000"
											show-count
											placeholder="請輸入領取方式說明" />
									</div>
									<div class="exchange-field">
										<label class="ai-sub-label">地點</label>
										<a-button>
											<template #icon><plus-outlined /></template>
											加入地點
										</a-button>
									</div>
								</div>
							</div>
						</div>

						<div class="plan-actions">
							<a-button>
								儲存
							</a-button>
							<a-button type="primary">
								儲存套用至所有方案
							</a-button>
						</div>
					</div>
					<div
						v-else
						class="plan-placeholder">
						此方案的行程內容與上方方案結構相同，此預覽僅展開第一個方案作示範。
					</div>
				</a-collapse-panel>
			</a-collapse>
		</div>
	</div>
</template>

<script>
import {
	PlusOutlined, ExclamationCircleFilled, UnorderedListOutlined, OrderedListOutlined, LinkOutlined,
	EnvironmentTwoTone, CoffeeOutlined,
} from '@ant-design/icons-vue';
import PkgSubCard from 'pages/product/layouts/PkgSubCard';
import {
	LOCATION_TYPES, SCHEDULE_CATEGORIES, SHUTTLE_LOCATION_ASSIGN_TYPES, SHUTTLE_TIME_TYPES,
} from 'constants/pages/product/pkgSchedule';
import ActivityCard from 'pages/preview/pkgSchedule/ActivityCard';

const ICON_SPARKLE = '' +
	'<path fill-rule="evenodd" clip-rule="evenodd" d="M11.993 6.04654L11.3084 6.73112L12.6021 8.02472L13.2867 7.34014C13.2653 7.26696 13.2368 7.18525' +
	' 13.2013 7.09982C13.1017 6.8604 12.9681 6.64207 12.8296 6.50362C12.6912 6.36516 12.4728 6.23159 12.2334 6.13203C12.1479 6.0965 12.0662 6.06799' +
	' 11.993 6.04654ZM11.6593 8.9675L10.3656 7.6739L6.92299 11.1162C6.50559 11.5336 6.25881 12.2125 6.12684 12.8724C6.09861 13.0136 6.07661 13.1489' +
	' 6.05948 13.2738C6.18423 13.2567 6.31929 13.2347 6.46031 13.2064C7.11992 13.0744 7.79891 12.8275 8.21677 12.4097L11.6593 8.9675ZM5.33333 14C4.66667' +
	' 14 4.66667 13.9996 4.66667 13.9996L4.66667 13.9983L4.66668 13.9957L4.66672 13.9882L4.66703 13.9637C4.66736 13.9432 4.66801 13.9146 4.66925 13.8787' +
	'C4.67172 13.807 4.67657 13.7058 4.6861 13.5819C4.7051 13.3349 4.74303 12.9928 4.81939 12.611C4.967 11.8728 5.27935 10.8742 5.98022 10.1733L11.485' +
	' 4.66897L11.7578 4.66669C12.0505 4.66424 12.4208 4.76597 12.7453 4.90089C13.0829 5.04126 13.4701 5.25848 13.7724 5.56077C14.0747 5.86307 14.292' +
	' 6.25029 14.4324 6.58784C14.5673 6.91231 14.669 7.28264 14.6666 7.5753L14.6643 7.8482L9.15954 13.3526C8.45845 14.0536 7.46003 14.3661 6.72196' +
	' 14.5138C6.34019 14.5903 5.99823 14.6282 5.75134 14.6472C5.62744 14.6568 5.52628 14.6616 5.45458 14.6641C5.41871 14.6653 5.39012 14.666 5.36965' +
	' 14.6663L5.34512 14.6666L5.3376 14.6667L5.33505 14.6667L5.33409 14.6667C5.33409 14.6667 5.33333 14.6667 5.33333 14ZM5.33333 14V14.6667H4.66667' +
	'V13.9996L5.33333 14Z" />' +
	'<path fill-rule="evenodd" clip-rule="evenodd" d="M3.72295 3.72295L4.36754 1.78918H5.63246L6.27705 3.72295L8.21082 4.36754V5.63246L6.27705' +
	' 6.27705L5.63246 8.21082H4.36754L3.72295 6.27705L1.78918 5.63246V4.36754L3.72295 3.72295ZM5 4.10818L4.88246 4.46082L4.46082 4.88246L4.10819' +
	' 5L4.46082 5.11754L4.88246 5.53918L5 5.89181L5.11754 5.53918L5.53918 5.11754L5.89182 5L5.53918 4.88246L5.11754 4.46082L5 4.10818Z" />';

let itemKeySeed = 0;
const nextItemKey = () => {
	itemKeySeed += 1;
	return `item_${itemKeySeed}`;
};

const buildTsukijiDay1 = () => [
	{
		key: nextItemKey(),
		kind: 'shuttle',
		expanded: true,
		locationType: LOCATION_TYPES.MEETING,
		location: '築地本願寺正門前',
		meetingTime: '05:20',
		departureTime: '05:30',
	},
	{
		key: nextItemKey(),
		kind: 'trip',
		expanded: true,
		category: SCHEDULE_CATEGORIES.LOCATION_SCHEDULE,
		location: '築地場外市場',
		startTime: '05:45',
		durationMinutes: 105,
		desc: '在地嚮導中文導覽，沿途認識當令海鮮與市場歷史，並巡禮乾貨老鋪。',
	},
];

const buildTsukijiDay2 = () => [
	{
		key: nextItemKey(),
		kind: 'trip',
		expanded: true,
		category: SCHEDULE_CATEGORIES.DESCRIPTION_SCHEDULE,
		location: '',
		startTime: '',
		durationMinutes: null,
		desc: '',
	},
	{
		key: nextItemKey(),
		kind: 'shuttle',
		expanded: true,
		locationType: LOCATION_TYPES.SHUTTLE,
		location: '築地場外市場門口',
		meetingTime: '08:20',
		departureTime: '08:30',
		shuttleAssignType: SHUTTLE_LOCATION_ASSIGN_TYPES.SUPPLIER_ASSIGNED,
		shuttleTimeType: SHUTTLE_TIME_TYPES.SINGLE_TIME,
	},
];

export default {
	name: 'PreviewPkgSchedule',
	inject: {
		sharedAiActions: {default: null},
		// 一個帳號一天共用的生成額度（{used, limit}），跟商品名稱/商品亮點/商品說明共用同一組
		sharedAiQuota: {default: null},
	},
	components: {
		PkgSubCard,
		ActivityCard,
		PlusOutlined,
		ExclamationCircleFilled,
		UnorderedListOutlined,
		OrderedListOutlined,
		LinkOutlined,
		EnvironmentTwoTone,
		CoffeeOutlined,
	},
	data() {
		return {
			plans: [
				{key: 'plan_bkk_transfer', name: '素萬那普機場 (BKK) 到酒店', statusTag: '下架中'},
				{key: 'plan_bkk_transfer_2', name: '素萬那普機場 (BKK) 到酒店', statusTag: '下架中'},
			],
			activePlanKeys: ['plan_bkk_transfer'],
			icons: {
				sparkle: ICON_SPARKLE,
			},
			aiState: 'idle', // idle | panelOpen
			aiMaterial: '',
			aiDuration: {
				day: undefined,
				hour: undefined,
				minute: undefined,
			},
			generating: false,
			// 生成超過一定時間還沒完成，才把 quota-hint 換成「生成中可以先去填別的欄位」的提示；
			// 太快完成的話閃一下反而干擾，就不用特別提示
			showGeneratingHint: false,
			generatingHintTimer: null,
			exchangeNote: '',
			totalDuration: {
				day: undefined,
				hour: undefined,
				minute: undefined,
			},
			days: [],
		};
	},
	computed: {
		quotaRemaining() {
			return this.sharedAiQuota ? Math.max(this.sharedAiQuota.limit - this.sharedAiQuota.used, 0) : null;
		},
	},
	methods: {
		generateSchedule() {
			this.generating = true;
			this.showGeneratingHint = false;
			clearTimeout(this.generatingHintTimer);
			this.generatingHintTimer = setTimeout(() => {
				this.showGeneratingHint = true;
			}, 800);
			if (this.sharedAiActions) {
				this.sharedAiActions.generating('productPkgSchedule');
			}
			setTimeout(() => {
				this.generating = false;
				this.showGeneratingHint = false;
				clearTimeout(this.generatingHintTimer);
				this.aiState = 'idle';
				this.totalDuration = {
					day: this.aiDuration.day ?? 2,
					hour: this.aiDuration.hour ?? 0,
					minute: this.aiDuration.minute ?? 0,
				};
				this.days = [
					{
						key: 'day_1', isExpanded: true, justGenerated: true, meals: ['breakfast'], schedules: buildTsukijiDay1(),
					},
					{
						key: 'day_2', isExpanded: true, justGenerated: true, meals: [], schedules: buildTsukijiDay2(),
					},
				];
				if (this.sharedAiActions) {
					this.sharedAiActions.generated('productPkgSchedule');
				}
				this.$nextTick(() => {
					setTimeout(() => {
						this.days.forEach(day => { day.justGenerated = false; });
					}, 2600);
				});
			}, 2000);
		},
		removeItem(day, item) {
			day.schedules = day.schedules.filter(schedule => schedule.key !== item.key);
		},
	},
};
</script>

<style lang="scss" scoped>
.plan-list {
	margin-top: var(--space-margin);
}

.itinerary-description {
	display: flex;
	flex-direction: column;
}

.section-title {
	font-size: 16px;
	font-weight: 700;
}

.intro-block {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin);
	padding: var(--space-margin-lg);
	background: var(--colors-neutral-fill-color-fill-quaternary);
}

.exchange-block {
	padding: var(--space-margin-lg);
	background: var(--colors-neutral-color-bg-base);
}

.intro-row {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-xxs);
}

.ai-trigger {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	width: fit-content;
	height: 32px;
	box-sizing: border-box;
	background: var(--colors-base-purple-1);
	color: var(--colors-base-purple-6);
	border: 1px solid var(--colors-base-purple-3);
	border-radius: var(--border-radius);
	padding: 0 15px;
	font-size: 14px;
	font-weight: 400;
	cursor: pointer;
	box-shadow: 0 1px 1px rgba(0, 0, 0, .03), 0 1px 3px rgba(0, 0, 0, .02), 0 2px 2px rgba(0, 0, 0, .02);

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}
}

.ai-panel {
	border: 1px solid var(--colors-base-purple-2);
	background: var(--colors-base-purple-1);
	border-radius: var(--border-radius-lg);
	padding: var(--space-margin-sm) var(--space-margin) var(--space-margin);
}

.ai-panel-head {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: var(--space-margin-sm);
	font-weight: 600;
	font-size: 14px;
	color: var(--colors-base-purple-6);

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}
}

.ai-panel-body {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin);
}

.ai-field-label {
	display: block;
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-neutral-text-color-text);
	margin-bottom: var(--space-margin-xs);
}

// 依 Figma node 2123:40503：產生前的提示改為黃色警示框（Ant Alert warning 樣式），
// 兩條編號說明，橘色驚嘆號 icon 靠上對齊。
.ai-disclaimer {
	display: flex;
	align-items: flex-start;
	gap: var(--space-margin-xs);
	padding: var(--space-margin-sm) var(--space-margin);
	background: var(--colors-base-orange-1);
	border: 1px solid var(--colors-base-orange-3);
	border-radius: var(--border-radius);
	font-size: 14px;
	line-height: 22px;
	color: var(--colors-neutral-text-color-text);

	.anticon {
		flex-shrink: 0;
		margin-top: 3px;
		color: var(--colors-brand-warning-color-warning);
	}
}

.ai-disclaimer-lines > div + div {
	margin-top: 2px;
}

.material-input {
	margin-bottom: 0;
}

.ai-sub-label {
	display: block;
	font-size: 12.5px;
	font-weight: 600;
	color: var(--colors-neutral-text-color-text);
	margin-bottom: 6px;
}

.gen-row {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 8px;

	:deep(.btn-ai.ant-btn-primary) {
		background: var(--colors-base-purple-5);
		border-color: var(--colors-base-purple-5);

		&:hover,
		&:focus {
			background: var(--colors-base-purple-6);
			border-color: var(--colors-base-purple-6);
		}
	}
}

// 依 Figma node 2123:40503：額度／生成中提示與取消/產生建議同一列，靠左（flex:1）
.quota-hint {
	flex: 1;
	text-align: right;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text-secondary);
}

.required {
	color: #e65f50;
	margin-right: 4px;
}

.form-option {
	gap: var(--space-margin-xs);
	align-items: center;
}

.total-duration {
	gap: var(--space-margin-xs);

	.form-label {
		white-space: nowrap;
	}
}

.day-cards {
	gap: var(--space-margin);

	// AI 幫寫面板展開時，行程模組的內容都會被產生結果取代，所以要跟總時長欄位一樣
	// 變成不可互動，避免使用者去編輯之後馬上就會被覆蓋掉的內容
	&.ai-fields-disabled {
		pointer-events: none;
		opacity: .5;
	}
}

.day-card {
	border-radius: var(--border-radius-lg);
	transition: box-shadow 1.8s ease-out;
	box-shadow: 0 0 0 3px rgba(114, 46, 209, 0);

	&.just-generated {
		box-shadow: 0 0 0 3px rgba(114, 46, 209, .35);
	}
}

.schedule-items {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-lg);

	&::before {
		content: '';
		position: absolute;
		top: 16px;
		bottom: 16px;
		left: 14px;
		width: 4px;
		background: var(--colors-neutral-border-color-split);
	}
}

.schedule-item-row {
	position: relative;
	z-index: 1;
	display: flex;
	align-items: flex-start;
	gap: var(--space-margin-sm);
}

.timeline-icon {
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: var(--colors-neutral-fill-color-filled-handle-bg);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
}

.schedule-item-card {
	flex: 1;
	min-width: 0;
}

.add-schedule-btn {
	margin-top: var(--space-margin);
}

.day-meals-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--space-margin-xs);
	margin-top: var(--space-margin);
}

.day-meals-icon {
	font-size: 16px;
	color: var(--colors-neutral-text-color-text);
}

.day-meals-label {
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
	white-space: nowrap;
}

.day-meals-options {
	display: flex;
	flex-wrap: wrap;
	gap: 16px;
}

.exchange-location {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-margin-xs);
	width: 100%;
}

.exchange-fields-group {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: var(--space-margin-lg);
	width: 100%;
}

.exchange-field {
	width: 100%;
}

.rte-toolbar {
	display: flex;
	align-items: center;
	gap: var(--space-margin-sm);
	padding: var(--space-margin-xs) var(--space-margin-sm);
	background: var(--colors-neutral-fill-color-fill-alter);
	border: 1px solid var(--colors-neutral-border-color-border);
	border-bottom: none;
	border-radius: var(--border-radius-sm) var(--border-radius-sm) 0 0;
	color: var(--colors-neutral-text-color-text-tertiary);
	font-size: 14px;
}

.rte-textarea {
	:deep(textarea) {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}
}

.plan-actions {
	display: flex;
	justify-content: flex-end;
	gap: var(--space-margin-sm);
	padding: var(--space-margin) var(--space-margin-lg) var(--space-margin-lg);
	margin-top: var(--space-margin-xl);
	background: var(--colors-neutral-color-bg-base);
}

.plan-collapse {
	background: transparent;

	:deep(.ant-collapse-item) {
		margin-bottom: var(--space-margin);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		box-shadow: inset 0 3px 0 0 #64b3f4;

		&:last-child {
			margin-bottom: 0;
		}
	}

	:deep(.ant-collapse-header) {
		align-items: center !important;
		background: rgba(0, 0, 0, .02);
	}

	:deep(.ant-collapse-content-box) {
		padding: var(--space-margin) 0;
		background: var(--colors-neutral-color-bg-base);
	}
}

.plan-title {
	margin-left: var(--space-margin-sm);
	font-size: 16px;
}

.plan-placeholder {
	padding: var(--space-margin-lg);
	color: var(--colors-neutral-text-color-text-tertiary);
	font-size: 13px;
}
</style>
