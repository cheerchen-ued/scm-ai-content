<template>
	<a-form
		layout="vertical"
		:label-col="{span: 24}"
		:wrapper-col="{span: 24}">
		<div class="page-card-header">
			商品描述
		</div>
		<div class="product-main-container">
			<div class="toggle-panel">
				<div
					class="toggle-panel-header"
					@click="panelExpanded.details = !panelExpanded.details">
					<down-outlined :class="{collapsed: !panelExpanded.details}" />
					<span>商品說明</span>
				</div>
				<div
					v-show="panelExpanded.details"
					class="toggle-panel-body">
					<a-form-item
						required
						label="商品說明">
						<div class="text-editor">
							<div class="text-editor-toolbar">
								<unordered-list-outlined />
								<ordered-list-outlined />
								<link-outlined />
							</div>
							<a-textarea
								ref="prodDescInput"
								v-model:value="formData.prodDesc"
								:rows="6"
								show-count
								:maxlength="25000"
								placeholder="請輸入商品說明" />
						</div>
						<ai-copy-assist
							class="ai-below-field"
							field-label="商品說明"
							field-id="productDescription"
							wide
							:suggestions="aiProdDescSuggestions"
							:prep-fields="aiPrepFields"
							:existing-content="formData.prodDesc"
							@apply="onAiApplyProdDesc" />
					</a-form-item>
					<a-form-item label="圖文組合說明">
						<div class="repeatable-list-box">
							<a-button disabled>
								<template #icon><plus-outlined /></template>
								新增欄位
							</a-button>
						</div>
					</a-form-item>
					<a-form-item label="建議包車路線">
						<div class="repeatable-input-row">
							<a-input
								disabled
								show-count
								:maxlength="2000"
								placeholder="請輸入內容" />
							<span class="row-action-group">
								<delete-outlined class="row-action" />
								<menu-outlined class="row-action" />
							</span>
						</div>
						<a-button disabled>
							<template #icon><plus-outlined /></template>
							新增欄位
						</a-button>
					</a-form-item>
					<div class="panel-actions">
						<a-button type="primary">
							儲存
						</a-button>
					</div>
				</div>
			</div>

			<div class="toggle-panel">
				<div
					class="toggle-panel-header"
					@click="panelExpanded.instruction = !panelExpanded.instruction">
					<down-outlined :class="{collapsed: !panelExpanded.instruction}" />
					<span>如何使用</span>
				</div>
				<div
					v-show="panelExpanded.instruction"
					class="toggle-panel-body">
					<a-form-item
						required
						label="旅客報到方式">
						<div class="checkin-method-row">
							<span class="checkin-method-prefix">現場出示：</span>
							<a-checkbox-group
								:value="['ticket']"
								disabled>
								<a-checkbox value="ticket">
									憑證或訂單編號
								</a-checkbox>
								<a-checkbox value="id">
									護照或身分證件
								</a-checkbox>
							</a-checkbox-group>
						</div>
					</a-form-item>
					<a-form-item label="旅客報到說明">
						<a-textarea
							disabled
							:rows="3"
							show-count
							:maxlength="10000"
							placeholder="請輸入旅客報到說明" />
					</a-form-item>
					<div class="panel-actions">
						<a-button type="primary">
							儲存
						</a-button>
					</div>
				</div>
			</div>

			<div class="toggle-panel">
				<div
					class="toggle-panel-header"
					@click="panelExpanded.note = !panelExpanded.note">
					<down-outlined :class="{collapsed: !panelExpanded.note}" />
					<span>購買須知</span>
				</div>
				<div
					v-show="panelExpanded.note"
					class="toggle-panel-body">
					<a-form-item label="購買須知說明">
						<div class="text-editor">
							<div class="text-editor-toolbar">
								<unordered-list-outlined />
								<ordered-list-outlined />
								<link-outlined />
							</div>
							<a-textarea
								disabled
								:rows="3"
								show-count
								:maxlength="2000"
								placeholder="請輸入購買須知說明" />
						</div>
					</a-form-item>
					<a-form-item label="其他費用">
						<a-radio-group
							value="none"
							disabled>
							<a-radio value="none">
								無
							</a-radio>
							<a-radio value="extra">
								額外費用
							</a-radio>
							<a-radio value="damage">
								設備損壞及損失計費標準
							</a-radio>
						</a-radio-group>
					</a-form-item>
					<a-form-item label="使用對象限制">
						<a-radio-group
							value="none"
							disabled>
							<a-radio value="none">
								無
							</a-radio>
							<a-radio value="limited">
								限定以下國籍
							</a-radio>
							<a-radio value="excluded">
								排除以下國籍
							</a-radio>
						</a-radio-group>
					</a-form-item>
					<a-form-item label="售前注意事項">
						<a-checkbox-group
							:value="[]"
							class="checklist-column"
							disabled>
							<a-checkbox value="minGroupSize">
								最少成團人數不足時，將取消旅遊行程並發出通知
							</a-checkbox>
							<a-checkbox value="weather">
								若遇颱風、暴風雪等天候不佳情況，將視情況取消出發
							</a-checkbox>
							<a-checkbox value="delay">
								因交通、天氣等不可抗力因素造成行程延誤時，可協助辦理部分退款
							</a-checkbox>
							<a-checkbox value="late">
								請務必準時抵達集合地點，逾時不候
							</a-checkbox>
							<a-checkbox value="ticket">
								兒童／長者恕不包含門票，需現場購票
							</a-checkbox>
						</a-checkbox-group>
					</a-form-item>
					<a-form-item label="售後須知">
						<div class="repeatable-input-row">
							<a-input
								disabled
								show-count
								:maxlength="2000"
								placeholder="請輸入內容" />
							<span class="row-action-group">
								<delete-outlined class="row-action" />
								<menu-outlined class="row-action" />
							</span>
						</div>
						<a-button disabled>
							<template #icon><plus-outlined /></template>
							新增欄位
						</a-button>
					</a-form-item>
					<div class="panel-actions">
						<a-button type="primary">
							儲存
						</a-button>
					</div>
				</div>
			</div>
		</div>
	</a-form>
</template>

<script>
import {
	DownOutlined, PlusOutlined, DeleteOutlined, MenuOutlined,
	UnorderedListOutlined, OrderedListOutlined, LinkOutlined,
} from '@ant-design/icons-vue';
import AiCopyAssist from 'components/common/AiCopyAssist';

export default {
	name: 'PreviewDescription',
	components: {
		DownOutlined,
		PlusOutlined,
		DeleteOutlined,
		MenuOutlined,
		UnorderedListOutlined,
		OrderedListOutlined,
		LinkOutlined,
		AiCopyAssist,
	},
	data() {
		return {
			panelExpanded: {
				details: true,
				instruction: false,
				note: false,
			},
			formData: {
				prodDesc: '',
			},
			aiProdDescSuggestions: [
				'築地市場是東京最具代表性的海鮮市場之一，這趟行程將由在地嚮導帶領，穿梭於熱鬧的場外市場，認識當令漁獲與職人文化，最後在市場內的老字號壽司店享用職人現捏的握壽司早餐，感受東京清晨最鮮活的一面。',
				'跟著擁有十年經驗的在地嚮導，走進築地市場的日常。從鮪魚拍賣區的緊張氣氛，到蔬果、乾貨攤位的討價還價，每一站都有嚮導的中文解說，讓你不只是走馬看花，而是真正理解這座百年市場的運作方式。',
				'這是一場屬於早起者的東京味覺巡禮：清晨集合、市場巡禮、職人壽司早餐，三個段落環環相扣，適合想在有限時間內深度體驗東京飲食文化，又不想錯過城市其他行程的旅人。',
			],
			// 固定依節點順序排列（1-1/1-2/5-1），不隨目前是哪個欄位而改變，
			// 只有命中目前 fieldId 的那項才會在 AiCopyAssist 裡換成「當前欄位」標籤
			aiPrepFields: [
				{fieldId: 'productBasicInfo', label: '商品名稱', step: 'STEP 1-1 · 基本資訊'},
				{fieldId: 'productHighlight', label: '商品亮點', step: 'STEP 1-2 · 圖片與亮點'},
				{fieldId: 'productDescription', label: '商品說明', step: 'STEP 5-1 · 商品描述'},
			],
		};
	},
	methods: {
		onAiApplyProdDesc(text) {
			this.formData.prodDesc = text;
			this.$nextTick(() => {
				const inputEl = this.$refs.prodDescInput?.$el;
				if (!inputEl) return;
				inputEl.classList.remove('ai-applied-flash');
				// eslint-disable-next-line no-void
				void inputEl.offsetWidth;
				inputEl.classList.add('ai-applied-flash');
			});
		},
	},
};
</script>

<style lang="scss" scoped>
// AI 幫寫獨立放在文字編輯框外面、下方（不是包在同一個邊框裡），
// 比照設計稿 node 2008:9879：跟框框保持一點間距，但緊接在後面、不夾任何其他內容。
.ai-below-field {
	margin-top: var(--space-margin-xs);
}

.toggle-panel {
	background: #fff;
	border-radius: var(--border-radius-lg);
	margin-bottom: var(--space-margin);
	overflow: hidden;

	&:first-child {
		margin-top: var(--space-margin);
	}
}

.toggle-panel-header {
	display: flex;
	align-items: center;
	gap: var(--space-margin-sm);
	padding: var(--space-margin-lg);
	font-weight: var(--typography-font-weight-strong);
	font-size: var(--typography-font-size-heading5);
	cursor: pointer;
	color: var(--colors-neutral-text-color-text-heading);

	.anticon {
		transition: transform .2s;

		&.collapsed {
			transform: rotate(-90deg);
		}
	}
}

.toggle-panel-body {
	padding: 0 var(--space-margin-lg) var(--space-margin-lg);

	:deep(.ant-form-item:last-of-type) {
		margin-bottom: 0;
	}
}

.text-editor {
	width: 100%;
	border-radius: var(--border-radius);
	overflow: hidden;
}

.text-editor-toolbar {
	display: flex;
	gap: var(--space-margin-sm);
	padding: var(--space-margin-sm);
	background: var(--colors-neutral-fill-color-fill-quaternary);
	border: 1px solid var(--colors-neutral-border-color-border);
	border-bottom: none;
	border-radius: var(--border-radius) var(--border-radius) 0 0;
	color: var(--colors-neutral-text-color-text-tertiary);
	font-size: 14px;
}

.text-editor :deep(.ant-input) {
	border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.repeatable-list-box {
	width: 100%;
	padding: var(--space-margin);
	background: var(--colors-neutral-bg-color-bg-layout);
	border-radius: var(--border-radius-lg);
}

.repeatable-input-row {
	display: flex;
	align-items: center;
	gap: var(--space-margin-xs);
	width: 100%;
	margin-bottom: var(--space-margin-xs);
}

.row-action-group {
	display: flex;
	align-items: center;
	gap: var(--space-margin-sm);
	flex-shrink: 0;
}

.row-action {
	flex-shrink: 0;
	color: var(--colors-neutral-text-color-text-tertiary);
}

.checkin-method-row {
	display: flex;
	align-items: center;
	gap: var(--space-margin-sm);
}

.checkin-method-prefix {
	flex-shrink: 0;
	color: var(--colors-neutral-text-color-text);
}

.checklist-column {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-xs);
}

.panel-actions {
	display: flex;
	justify-content: flex-start;
	margin-top: var(--space-margin-xl);
}

@keyframes ai-applied-flash {
	0% {
		box-shadow: 0 0 0 3px rgba(114, 46, 209, .35);
	}

	100% {
		box-shadow: 0 0 0 3px rgba(114, 46, 209, 0);
	}
}

:deep(.ai-applied-flash) {
	animation: ai-applied-flash 1.8s ease-out;
}
</style>
