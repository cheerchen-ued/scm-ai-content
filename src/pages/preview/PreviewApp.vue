<template>
	<a-config-provider
		:auto-insert-space-in-button="false"
		:theme="customTheme">
		<preview-chrome
			:active-node-id="currentNode"
			@navigate="currentNode = $event">
			<!-- 四個節點都一直掛載著，只用 v-show 切換顯示：避免切換節點時整個元件被銷毀重建，
			導致使用者已經填寫或套用的內容（例如商品名稱套用完的文案）被清空。 -->
			<preview-basic-info v-show="currentNode === 'productBasicInfo'" />
			<preview-highlight v-show="currentNode === 'productHighlight'" />
			<preview-description v-show="currentNode === 'productDescription'" />
			<preview-pkg-schedule v-show="currentNode === 'productPkgSchedule'" />
			<div v-if="!isImplemented">
				<div class="page-card-header">
					此節點未於本預覽建置
				</div>
				<div class="page-card-content">
					本機預覽僅完整建置了「商品名稱」「商品亮點」「商品描述」「行程管理」四個節點，其餘節點僅顯示側欄以維持版面完整。
				</div>
			</div>
		</preview-chrome>

		<div class="ai-toast-stack">
			<div
				v-for="toast in toasts"
				:key="toast.id"
				class="ai-toast">
				<thunderbolt-outlined class="ai-toast-icon" />
				<div class="ai-toast-text">
					<strong>{{ toast.label }}</strong> 已經幫你準備好建議了
				</div>
				<div class="ai-toast-actions">
					<a-button
						type="link"
						size="small"
						@click="viewToastField(toast)">
						查看
					</a-button>
					<close-outlined
						class="ai-toast-close"
						@click="dismissToast(toast.id)" />
				</div>
			</div>
		</div>
	</a-config-provider>
</template>

<script>
import {ThunderboltOutlined, CloseOutlined} from '@ant-design/icons-vue';
import {generateToken} from 'configs/designSystem';
import PreviewChrome from 'pages/preview/PreviewChrome';
import PreviewBasicInfo from 'pages/preview/PreviewBasicInfo';
import PreviewHighlight from 'pages/preview/PreviewHighlight';
import PreviewDescription from 'pages/preview/PreviewDescription';
import PreviewPkgSchedule from 'pages/preview/PreviewPkgSchedule';

const PAGE_COMPONENTS = {
	productBasicInfo: PreviewBasicInfo,
	productHighlight: PreviewHighlight,
	productDescription: PreviewDescription,
	productPkgSchedule: PreviewPkgSchedule,
};

// 商品名稱／商品亮點／商品說明共用同一份素材一次生成，跟 2-2 行程管理各自獨立的 AI 流程無關
const AI_FIELD_META = {
	productBasicInfo: {label: '商品名稱'},
	productHighlight: {label: '商品亮點'},
	productDescription: {label: '商品說明'},
	productPkgSchedule: {label: '行程管理'},
};

// 只有這幾個欄位共用同一份素材，生成時才會互相連動狀態；2-2 行程管理是獨立流程，只會更新自己的狀態
const SHARED_MATERIAL_FIELD_IDS = ['productBasicInfo', 'productHighlight', 'productDescription'];

let toastKeySeed = 0;
const nextToastKey = () => {
	toastKeySeed += 1;
	return `toast_${toastKeySeed}`;
};

export default {
	name: 'PreviewApp',
	components: {
		PreviewChrome,
		PreviewBasicInfo,
		PreviewHighlight,
		PreviewDescription,
		PreviewPkgSchedule,
		ThunderboltOutlined,
		CloseOutlined,
	},
	provide() {
		return {
			sharedAiStatus: this.aiFieldStatus,
			sharedAiMaterial: this.aiMaterialState,
			// 一個帳號一天共用同一組生成額度，商品名稱/商品亮點/商品說明（共用素材，一次生成算一次）
			// 跟行程管理各自獨立的生成流程，都算在同一個總額度裡
			sharedAiQuota: this.aiQuotaState,
			// 目前使用者停留在哪個節點：套用建議後出現的滿意度回饋區塊，離開該欄位所在節點時要自動收起
			sharedActiveNode: this.activeNodeState,
			sharedAiActions: {
				generating: this.handleFieldGenerating,
				generated: this.handleFieldGenerated,
				applied: this.handleFieldApplied,
			},
		};
	},
	data() {
		return {
			currentNode: 'productBasicInfo',
			pageComponents: PAGE_COMPONENTS,
			customTheme: generateToken(),
			aiFieldStatus: {
				productBasicInfo: 'idle',
				productHighlight: 'idle',
				productDescription: 'idle',
				productPkgSchedule: 'idle',
			},
			// 商品名稱／商品亮點／商品說明共用同一份素材文字，任一頁面重新打開 AI 面板都看得到同一份
			aiMaterialState: {text: ''},
			aiQuotaState: {used: 0, limit: 10},
			activeNodeState: {current: 'productBasicInfo'},
			toasts: [],
		};
	},
	computed: {
		isImplemented() {
			return !!this.pageComponents[this.currentNode];
		},
	},
	watch: {
		currentNode(value) {
			this.activeNodeState.current = value;
		},
	},
	methods: {
		handleFieldGenerating(sourceId) {
			this.aiFieldStatus[sourceId] = 'generating';
			// 不管是共用素材那三個欄位、還是行程管理各自獨立的生成，都算用掉一次共用額度
			this.aiQuotaState.used = Math.min(this.aiQuotaState.used + 1, this.aiQuotaState.limit);
			if (!SHARED_MATERIAL_FIELD_IDS.includes(sourceId)) {
				return;
			}
			SHARED_MATERIAL_FIELD_IDS.forEach(id => {
				if (id === sourceId || this.aiFieldStatus[id] !== 'idle') {
					return;
				}
				this.aiFieldStatus[id] = 'generating';
			});
		},
		handleFieldGenerated(sourceId) {
			this.aiFieldStatus[sourceId] = 'ready';
			if (!SHARED_MATERIAL_FIELD_IDS.includes(sourceId)) {
				// 行程管理是獨立生成、沒有共用素材連動，但一樣可能在生成時被使用者先離開去填別的
				// 欄位，所以完成時如果已經不在這個節點上，也要跳 toast 通知，跟共用素材欄位一致
				if (sourceId !== this.currentNode) {
					this.pushToast(sourceId);
				}
				return;
			}
			SHARED_MATERIAL_FIELD_IDS.forEach(id => {
				if (id === sourceId || this.aiFieldStatus[id] !== 'generating') {
					return;
				}
				this.aiFieldStatus[id] = 'ready';
				if (id !== this.currentNode) {
					this.pushToast(id);
				}
			});
		},
		handleFieldApplied(fieldId) {
			this.aiFieldStatus[fieldId] = 'applied';
			this.toasts = this.toasts.filter(toast => toast.fieldId !== fieldId);
		},
		pushToast(fieldId) {
			const id = nextToastKey();
			this.toasts.push({id, fieldId, label: AI_FIELD_META[fieldId].label});
			setTimeout(() => this.dismissToast(id), 8000);
		},
		dismissToast(id) {
			this.toasts = this.toasts.filter(toast => toast.id !== id);
		},
		viewToastField(toast) {
			this.currentNode = toast.fieldId;
			this.dismissToast(toast.id);
		},
	},
};
</script>

<style lang="scss" scoped>
.ai-toast-stack {
	position: fixed;
	right: var(--space-margin-lg);
	bottom: var(--space-margin-lg);
	z-index: 50;
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-sm);
	max-width: 340px;
}

.ai-toast {
	display: flex;
	align-items: flex-start;
	gap: var(--space-margin-xs);
	background: var(--colors-neutral-color-bg-base);
	border: 1px solid var(--colors-base-purple-2);
	border-radius: var(--border-radius-lg);
	box-shadow: 0 8px 24px rgba(0, 0, 0, .14);
	padding: var(--space-margin) var(--space-margin);
	font-size: 13px;
	animation: ai-toast-in .18s ease;
}

@keyframes ai-toast-in {
	from {
		opacity: 0;
		transform: translateY(8px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.ai-toast-icon {
	color: var(--colors-base-purple-6);
	font-size: 16px;
	flex-shrink: 0;
	margin-top: 2px;
}

.ai-toast-text {
	flex: 1;
	line-height: 1.5;
	color: var(--colors-neutral-text-color-text);

	strong {
		color: var(--colors-base-purple-6);
	}
}

.ai-toast-actions {
	display: flex;
	align-items: center;
	gap: var(--space-margin-xs);
	flex-shrink: 0;
}

.ai-toast-close {
	color: var(--colors-neutral-text-color-text-tertiary);
	cursor: pointer;
	font-size: 14px;

	&:hover {
		color: var(--colors-neutral-text-color-text);
	}
}
</style>
