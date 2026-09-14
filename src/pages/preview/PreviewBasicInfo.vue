<template>
	<a-form
		class="d-flex flex-column"
		:model="formData"
		:label-col="{span: 24}"
		:wrapper-col="{span: 24}">
		<div class="page-card-header">
			建立商品基本資訊
		</div>
		<div class="page-card-content">
			<a-form-item
				required
				name="mainCategory"
				label="商品分類">
				<a-cascader
					placeholder="請選擇商品分類"
					disabled />
			</a-form-item>
			<a-form-item
				required
				name="masterLang"
				label="接下來，您想以什麼語言編輯這支商品？"
				extra="請注意！選定編輯語言後不可再異動">
				<a-select
					placeholder="請選擇編輯語言"
					disabled />
			</a-form-item>
			<a-form-item
				required
				name="name"
				label="商品名稱">
				<div class="name-field-grid">
					<a-input
						ref="nameInput"
						v-model:value="formData.name"
						class="name-input"
						show-count
						:maxlength="500"
						placeholder="請輸入商品名稱" />
					<ai-copy-assist
						inline
						field-label="商品名稱"
						field-id="productBasicInfo"
						:suggestions="aiNameSuggestions"
						:prep-fields="aiPrepFields"
						:existing-content="formData.name"
						@apply="onAiApplyName" />
					<!-- 欄位原本的說明文字（caption）要緊跟在輸入框下面，不能被 AI 面板/建議清單
					隔開，所以直接排進 grid 裡（不用 a-form-item 的 #extra，那個永遠排在最後面）。 -->
					<div class="name-caption">
						建議依照『體驗城市 + 行程 + 規格』的格式撰寫，並避免使用特殊符號。
					</div>
				</div>
			</a-form-item>
		</div>
	</a-form>
</template>

<script>
import AiCopyAssist from 'components/common/AiCopyAssist';

export default {
	name: 'PreviewBasicInfo',
	components: {
		AiCopyAssist,
	},
	data() {
		return {
			formData: {
				name: '',
			},
			aiNameSuggestions: [
				'築地市場清晨海鮮巡禮：職人早市 X 壽司早餐體驗',
				'東京築地市場半日遊｜在地嚮導帶你逛遍海鮮拍賣市場',
				'築地市場早市導覽＋職人壽司早餐（含中文嚮導）',
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
		onAiApplyName(text) {
			this.formData.name = text;
			this.$nextTick(() => {
				const inputEl = this.$refs.nameInput?.$el;
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
// 輸入框跟 AI 幫寫按鈕同排（按鈕固定在輸入框右邊、常駐顯示），素材面板/建議清單
// 展開時排到整排下方，比照 Figma node 2057:276395 的版面（Frame 64054 + Frame 64055）。
.name-field-grid {
	display: grid;
	grid-template-columns: 1fr auto;
	column-gap: var(--space-margin-xs);
	row-gap: var(--space-margin-xs);
	align-items: start;
}

.name-input {
	grid-column: 1;
	grid-row: 1;
}

:deep(.ai-trigger) {
	grid-column: 2;
	grid-row: 1;
}

.name-caption {
	grid-column: 1 / -1;
	grid-row: 2;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text-tertiary);
}

:deep(.ai-panel),
:deep(.ai-ready-block),
:deep(.ai-feedback) {
	grid-column: 1 / -1;
	grid-row: 3;
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
