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
				class="ai-toast"
				@mouseenter="pauseToast(toast)"
				@mouseleave="resumeToast(toast)">
				<thunderbolt-outlined class="ai-toast-icon" />
				<div class="ai-toast-text">
					已經幫你準備好 <strong>{{ toast.label }}</strong> 的建議
					<div class="ai-toast-sub">
						可在左側選單查看標記的欄位
					</div>
				</div>
				<close-outlined
					class="ai-toast-close"
					@click="dismissToast(toast.id)" />
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
import {getSidemenu, getSteps} from 'libs/prodSidemenu';

// 各 AI 節點的步驟（group）索引，用來判斷「已解鎖」（使用者走得到）與否；tour 版才含行程管理
const STEP_MAP = getSteps(getSidemenu(true));

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
			// 側欄紫點的統一規則會用到：某節點的建議是否已被看過、以及已解鎖界線
			sharedAiSeen: this.aiSeen,
			sharedAiUnlock: this.aiUnlock,
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
			// 每個 AI 節點目前準備好的建議是否已被看過（進到該節點就算看過）；看過就不再亮紫點
			aiSeen: {
				productBasicInfo: false,
				productHighlight: false,
				productDescription: false,
				productPkgSchedule: false,
			},
			// 已解鎖界線：使用者走到過的最遠步驟索引（單調遞增）；step 大於它的節點視為尚未解鎖
			aiUnlock: {maxStep: STEP_MAP.productBasicInfo.step},
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
			// 使用者走到過的最遠步驟（單調遞增）＝「已解鎖」的界線
			const step = STEP_MAP[value] ? STEP_MAP[value].step : 0;
			if (step > this.aiUnlock.maxStep) {
				this.aiUnlock.maxStep = step;
			}
			// 進到某節點就算「看過」它目前準備好的建議 → 清掉它的紫點（看過就清除）
			if (this.aiFieldStatus[value] === 'ready') {
				this.aiSeen[value] = true;
			}
		},
	},
	methods: {
		handleFieldGenerating(sourceId) {
			this.aiFieldStatus[sourceId] = 'generating';
			// 新一輪生成：把「看過」重置，這輪完成後才會重新亮紫點
			this.aiSeen[sourceId] = false;
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
				this.aiSeen[id] = false;
			});
		},
		handleFieldGenerated(sourceId) {
			const readied = [sourceId];
			this.aiFieldStatus[sourceId] = 'ready';
			if (SHARED_MATERIAL_FIELD_IDS.includes(sourceId)) {
				SHARED_MATERIAL_FIELD_IDS.forEach(id => {
					if (id === sourceId || this.aiFieldStatus[id] !== 'generating') {
						return;
					}
					this.aiFieldStatus[id] = 'ready';
					readied.push(id);
				});
			}
			// 若建議是在「當前節點」完成的，代表使用者正看著它 → 直接算看過（不亮紫點、不通知）
			readied.forEach(id => {
				if (id === this.currentNode) {
					this.aiSeen[id] = true;
				}
			});
			// 統一規則：只通知「已解鎖 && 非當前 && 尚未看過」的節點，合併成一則 toast；
			// 其餘（當前節點自己看得到、未解鎖走不到）都不通知，未解鎖的交給側欄紫點在解鎖後接手
			const notify = readied.filter(id => this.isNotifiable(id));
			if (notify.length) {
				this.pushToast(notify);
			}
		},
		handleFieldApplied(fieldId) {
			this.aiFieldStatus[fieldId] = 'applied';
		},
		// 側欄紫點／toast 共用的可提示判斷：已解鎖（走得到）、非當前節點、且有尚未看過的新建議
		isNotifiable(fieldId) {
			if (fieldId === this.currentNode) {
				return false;
			}
			const step = STEP_MAP[fieldId] ? STEP_MAP[fieldId].step : Infinity;
			if (step > this.aiUnlock.maxStep) {
				return false;
			}
			return this.aiFieldStatus[fieldId] === 'ready' && !this.aiSeen[fieldId];
		},
		// 無 CTA 的提醒 toast：合併多個節點成一則，只陳述「已備好建議」，不帶查看動作（不打斷當前操作）
		pushToast(fieldIds) {
			const label = fieldIds.map(id => AI_FIELD_META[id].label).join('、');
			const id = nextToastKey();
			const toast = {id, label, timer: null};
			toast.timer = setTimeout(() => this.dismissToast(id), 7000);
			this.toasts.push(toast);
		},
		dismissToast(id) {
			const toast = this.toasts.find(item => item.id === id);
			if (toast && toast.timer) {
				clearTimeout(toast.timer);
			}
			this.toasts = this.toasts.filter(item => item.id !== id);
		},
		// hover 時暫停自動消失，避免還沒讀完就被收走；移開後給一小段時間再收
		pauseToast(toast) {
			if (toast.timer) {
				clearTimeout(toast.timer);
				toast.timer = null;
			}
		},
		resumeToast(toast) {
			toast.timer = setTimeout(() => this.dismissToast(toast.id), 3000);
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

.ai-toast-sub {
	margin-top: 2px;
	font-size: 12px;
	color: var(--colors-neutral-text-color-text-tertiary);
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
