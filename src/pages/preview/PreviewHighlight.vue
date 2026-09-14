<template>
	<a-form
		class="d-flex flex-column"
		:model="formData"
		:label-col="{span: 24}"
		:wrapper-col="{span: 24}">
		<div class="page-card-header">
			讓你的商品脫穎而出
		</div>
		<div class="page-card-content">
			<a-form-item
				required
				name="desc"
				label="商品摘要">
				<a-input
					v-model:value="formData.desc"
					show-count
					:maxlength="1500"
					placeholder="請輸入商品摘要" />
			</a-form-item>
			<a-form-item
				name="feature"
				label="商品亮點">
				<div class="text-editor">
					<div class="text-editor-toolbar">
						<unordered-list-outlined />
						<ordered-list-outlined />
						<link-outlined />
					</div>
					<a-textarea
						ref="featureInput"
						v-model:value="formData.feature"
						:rows="6"
						show-count
						:maxlength="2000"
						placeholder="請輸入商品亮點" />
				</div>
				<ai-copy-assist
					class="ai-below-field"
					field-label="商品亮點"
					field-id="productHighlight"
					wide
					:suggestions="aiFeatureSuggestions"
					:prep-fields="aiPrepFields"
					:existing-content="formData.feature"
					@apply="onAiApplyFeature" />
			</a-form-item>
			<a-form-item
				required
				name="photo"
				label="商品圖片"
				extra="圖片上不得放置 logo、文字、浮水印、拼接圖，並請確保圖片有授權。上限為10張。">
				<div class="upload-placeholder">
					<picture-outlined />
					<span class="upload-title">點擊或拖曳圖片至此處</span>
					<span class="upload-hint">建議 1920x1440px 橫式圖片，格式為 JPG 或 PNG，檔案上限 2MB</span>
				</div>
			</a-form-item>
			<a-form-item label="商品影片">
				<a-radio-group
					class="video-radio-group"
					value="universal"
					disabled>
					<a-radio value="universal">
						不分語系
					</a-radio>
					<a-radio value="specific">
						區分語系
					</a-radio>
				</a-radio-group>
			</a-form-item>
		</div>
	</a-form>
</template>

<script>
import {
	PictureOutlined, UnorderedListOutlined, OrderedListOutlined, LinkOutlined,
} from '@ant-design/icons-vue';
import AiCopyAssist from 'components/common/AiCopyAssist';

export default {
	name: 'PreviewHighlight',
	components: {
		PictureOutlined,
		UnorderedListOutlined,
		OrderedListOutlined,
		LinkOutlined,
		AiCopyAssist,
	},
	data() {
		return {
			formData: {
				desc: '',
				feature: '',
			},
			aiFeatureSuggestions: [
				'清晨五點的築地市場還未甦醒，職人已在準備一天中最新鮮的漁獲。跟著在地嚮導穿梭市場巷弄，親手挑選當令海鮮，再由老師傅現場捏製成握壽司，一口咬下就是東京最道地的早晨滋味。',
				'不只是逛市場，這是一堂活生生的職人課。從鮪魚拍賣的緊張氣氛，到刀工俐落的壽司捏製示範，每個環節都由專業嚮導講解幕後故事，讓你看懂築地市場運作了上百年的職人精神。',
				'限量小團體，避開觀光人潮，走進當地人才知道的隱藏攤位。市場巡禮後直接入座職人壽司吧檯，現點現做的握壽司搭配熱味噌湯，是東京行程裡最值得早起的一餐。',
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
		onAiApplyFeature(text) {
			this.formData.feature = text;
			this.$nextTick(() => {
				const inputEl = this.$refs.featureInput?.$el;
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

.upload-placeholder {
	width: 320px;
	height: 180px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--space-margin);
	padding: var(--space-margin);
	border: 1px dashed var(--colors-neutral-border-color-border);
	border-radius: var(--border-radius-lg);
	background: var(--colors-neutral-fill-color-fill-quaternary);
	color: var(--colors-neutral-text-color-text-tertiary);
	font-size: 48px;
}

.upload-title {
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
}

.upload-hint {
	font-size: 12px;
	color: var(--colors-neutral-text-color-text-tertiary);
	text-align: center;
}

.text-editor {
	width: 100%;
	border-radius: var(--border-radius);
	overflow: hidden;
}

.text-editor-toolbar {
	display: flex;
	align-items: center;
	height: 32px;
	gap: var(--space-margin-sm);
	padding: 0 var(--space-margin-sm);
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

.video-radio-group {
	display: flex;
	gap: var(--space-margin);
}

.video-radio-group :deep(.ant-radio-wrapper) {
	margin-inline-end: 0;
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
