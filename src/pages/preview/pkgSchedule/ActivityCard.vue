<!-- eslint-disable vue/no-mutating-props -->
<!-- item is a locally-owned mock object passed down for this preview-only page, not a shared -->
<!-- public component contract, so direct field edits via v-model here are intentional. -->
<template>
	<div class="activity-card">
		<div
			class="activity-card-header"
			@click="$emit('toggle')">
			<right-outlined
				v-if="!item.expanded"
				class="chevron" />
			<down-outlined
				v-else
				class="chevron" />
			<span class="activity-title">{{ categoryLabel }}</span>
			<span
				v-if="!item.expanded"
				class="activity-summary"
				:class="{ incomplete: !isComplete }">
				<span
					v-if="!isComplete"
					class="required">*</span>
				{{ isComplete ? summaryText : '尚未填寫完整' }}
			</span>
			<span class="spacer" />
			<delete-outlined
				class="action-icon"
				@click.stop="$emit('delete')" />
			<menu-outlined class="action-icon drag-handle" />
		</div>

		<div
			v-if="item.expanded"
			class="activity-card-body">
			<template v-if="item.kind === 'shuttle'">
				<div class="field-row">
					<label class="field-label"><span class="required">*</span>類型</label>
					<a-radio-group v-model:value="item.locationType">
						<a-radio :value="LOCATION_TYPES.MEETING">
							集合地點
						</a-radio>
						<a-radio :value="LOCATION_TYPES.SHUTTLE">
							接駁地點
						</a-radio>
					</a-radio-group>
				</div>

				<template v-if="item.locationType === LOCATION_TYPES.MEETING">
					<div class="field-row">
						<label class="field-label"><span class="required">*</span>地點</label>
						<a-input
							v-model:value="item.location"
							class="field-input"
							placeholder="請輸入或從地點庫選擇地點" />
					</div>
					<div class="field-row">
						<label class="field-label"><span class="required">*</span>集合時間</label>
						<a-time-picker
							v-model:value="item.meetingTime"
							class="field-time"
							value-format="HH:mm"
							format="HH:mm"
							placeholder="選擇時間" />
					</div>
					<div class="field-row">
						<label class="field-label"><span class="required">*</span>出發時間</label>
						<a-time-picker
							v-model:value="item.departureTime"
							class="field-time"
							value-format="HH:mm"
							format="HH:mm"
							placeholder="選擇時間" />
					</div>
				</template>

				<template v-else>
					<div class="field-row">
						<label class="field-label"><span class="required">*</span>地點</label>
						<div class="field-stack">
							<a-radio-group v-model:value="item.shuttleAssignType">
								<a-radio :value="SHUTTLE_LOCATION_ASSIGN_TYPES.SUPPLIER_ASSIGNED">
									供應商指定
								</a-radio>
								<a-radio :value="SHUTTLE_LOCATION_ASSIGN_TYPES.TRAVELER_ASSIGNED">
									開放旅客指定
								</a-radio>
							</a-radio-group>
							<a-input
								v-model:value="item.location"
								class="field-input"
								placeholder="請輸入或從地點庫選擇地點" />
						</div>
					</div>
					<div class="field-row">
						<label class="field-label"><span class="required">*</span>接駁時間</label>
						<div class="field-stack">
							<a-radio-group v-model:value="item.shuttleTimeType">
								<a-radio :value="SHUTTLE_TIME_TYPES.SINGLE_TIME">
									單一時間
								</a-radio>
								<a-radio :value="SHUTTLE_TIME_TYPES.TIME_RANGE">
									時間區間
								</a-radio>
								<a-radio :value="SHUTTLE_TIME_TYPES.NOTIFY_AFTER_BOOKING">
									訂購後通知
								</a-radio>
							</a-radio-group>
							<a-time-picker
								v-if="item.shuttleTimeType !== SHUTTLE_TIME_TYPES.NOTIFY_AFTER_BOOKING"
								v-model:value="item.departureTime"
								class="field-time"
								value-format="HH:mm"
								format="HH:mm"
								placeholder="選擇時間" />
						</div>
					</div>
				</template>
			</template>

			<template v-else>
				<div class="field-row">
					<label class="field-label"><span class="required">*</span>類型</label>
					<a-radio-group v-model:value="item.category">
						<a-radio :value="SCHEDULE_CATEGORIES.LOCATION_SCHEDULE">
							有明確地點
							<a-tag color="blue">建議</a-tag>
						</a-radio>
						<a-radio :value="SCHEDULE_CATEGORIES.DESCRIPTION_SCHEDULE">
							純行程描述
						</a-radio>
					</a-radio-group>
				</div>
				<div
					v-if="item.category === SCHEDULE_CATEGORIES.LOCATION_SCHEDULE"
					class="field-row">
					<label class="field-label"><span class="required">*</span>地點</label>
					<a-input
						v-model:value="item.location"
						class="field-input"
						placeholder="請輸入或從地點庫選擇地點" />
				</div>
				<div
					v-else
					class="field-row">
					<label class="field-label"><span class="required">*</span>簡述</label>
					<a-input
						v-model:value="item.desc"
						class="field-input"
						placeholder="請輸入行程簡述" />
				</div>
				<div class="field-row">
					<label class="field-label"><span class="required">*</span>開始時間</label>
					<a-time-picker
						v-model:value="item.startTime"
						class="field-time"
						value-format="HH:mm"
						format="HH:mm"
						placeholder="選擇時間" />
				</div>
				<div class="field-row">
					<label class="field-label">停留時長</label>
					<a-input-number
						v-model:value="item.durationMinutes"
						class="field-time"
						:min="0"
						addon-after="分鐘" />
				</div>
				<div
					v-if="item.category === SCHEDULE_CATEGORIES.LOCATION_SCHEDULE"
					class="field-row">
					<label class="field-label">描述</label>
					<a-textarea
						v-model:value="item.desc"
						class="field-input"
						:auto-size="{ minRows: 2, maxRows: 4 }"
						placeholder="補充說明此行程內容" />
				</div>
			</template>
		</div>
	</div>
</template>

<script>
import {
	RightOutlined, DownOutlined, DeleteOutlined, MenuOutlined,
} from '@ant-design/icons-vue';
import {
	LOCATION_TYPES, SCHEDULE_CATEGORIES, SHUTTLE_LOCATION_ASSIGN_TYPES, SHUTTLE_TIME_TYPES,
} from 'constants/pages/product/pkgSchedule';

const LOCATION_TYPE_LABELS = {
	[LOCATION_TYPES.MEETING]: '集合',
	[LOCATION_TYPES.SHUTTLE]: '接駁',
};

function isActivityItemComplete(item) {
	if (item.kind === 'shuttle') {
		if (item.locationType === LOCATION_TYPES.SHUTTLE) {
			const hasTime = item.shuttleTimeType === SHUTTLE_TIME_TYPES.NOTIFY_AFTER_BOOKING ?
				true :
				!!item.departureTime;

			return !!(item.location && item.shuttleAssignType && item.shuttleTimeType && hasTime);
		}

		return !!(item.location && item.meetingTime && item.departureTime);
	}

	const hasContent = item.category === SCHEDULE_CATEGORIES.LOCATION_SCHEDULE ?
		!!item.location :
		!!item.desc;

	return hasContent && !!item.startTime;
}

export default {
	name: 'ActivityCard',
	components: {
		RightOutlined,
		DownOutlined,
		DeleteOutlined,
		MenuOutlined,
	},
	props: {
		item: {
			type: Object,
			required: true,
		},
	},
	emits: ['toggle', 'delete'],
	data() {
		return {
			LOCATION_TYPES,
			SCHEDULE_CATEGORIES,
			SHUTTLE_LOCATION_ASSIGN_TYPES,
			SHUTTLE_TIME_TYPES,
		};
	},
	computed: {
		categoryLabel() {
			return this.item.kind === 'shuttle' ? '集合/接駁' : '行程';
		},
		isComplete() {
			return isActivityItemComplete(this.item);
		},
		summaryText() {
			if (this.item.kind === 'shuttle') {
				const label = LOCATION_TYPE_LABELS[this.item.locationType] || '集合';

				if (this.item.locationType === LOCATION_TYPES.SHUTTLE) {
					const timePart = this.item.shuttleTimeType === SHUTTLE_TIME_TYPES.NOTIFY_AFTER_BOOKING ?
						'訂購後通知' :
						this.item.departureTime;

					return `${label} ${timePart}・${this.item.location}`;
				}

				return `${label} ${this.item.meetingTime} → 出發 ${this.item.departureTime}・${this.item.location}`;
			}

			const title = this.item.category === SCHEDULE_CATEGORIES.LOCATION_SCHEDULE ?
				this.item.location :
				this.item.desc;

			return `${this.item.startTime}・${title}`;
		},
	},
};
</script>

<style lang="scss" scoped>
.activity-card {
	width: 100%;
	border: 1px solid var(--colors-neutral-border-color-border-secondary);
	border-radius: var(--border-radius-lg);
	overflow: hidden;
}

.activity-card-header {
	display: flex;
	align-items: center;
	gap: var(--space-margin-sm);
	padding: var(--space-margin-sm) var(--space-margin);
	background: rgba(0, 0, 0, .02);
	border-bottom: 1px solid var(--colors-neutral-border-color-border-secondary);
	cursor: pointer;
	font-size: 14px;

	.chevron {
		font-size: 14px;
		flex-shrink: 0;
	}
}

.activity-title {
	font-weight: 600;
	white-space: nowrap;
}

.activity-summary {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
	color: var(--colors-neutral-text-color-text-secondary);

	&.incomplete {
		color: var(--colors-neutral-text-color-text-disabled);
	}
}

.required {
	color: #e65f50;
	margin-right: 4px;
}

.spacer {
	flex: 1;
	min-width: 0;
}

.action-icon {
	flex-shrink: 0;
	font-size: 16px;
	opacity: .45;

	&:hover {
		opacity: .75;
	}
}

.drag-handle {
	cursor: grab;
}

.activity-card-body {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-sm);
	padding: var(--space-margin);
	background: rgba(0, 0, 0, .02);
}

.field-row {
	display: flex;
	align-items: flex-start;
	gap: var(--space-margin-xs);
}

.field-label {
	flex-shrink: 0;
	width: 76px;
	padding-top: 5px;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
	text-align: right;
}

.field-input {
	flex: 1;
	min-width: 0;
	max-width: 400px;
}

.field-stack {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-xs);
	flex: 1;
	min-width: 0;
}

.field-time {
	width: 160px;
}
</style>
