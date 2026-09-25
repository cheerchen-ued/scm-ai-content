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
	</a-config-provider>
</template>

<script>
import {h} from 'vue';
import {notification} from 'ant-design-vue';
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

// 完成通知用 antd notification 呈現：固定 key 讓錯開完成的節點原地更新（累加）成同一則、
// 不會連跳多則；duration 為自動消失秒數（對應 spec 的 N）
const NOTIF_KEY = 'ai-suggestion-ready';
const NOTIF_DURATION = 4;

// AI GenerateText 火花圖示（與 AiCopyAssist 同一份），依設計稿放在通知左側、紫色
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

export default {
	name: 'PreviewApp',
	components: {
		PreviewChrome,
		PreviewBasicInfo,
		PreviewHighlight,
		PreviewDescription,
		PreviewPkgSchedule,
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
			// 目前累加中那則通知涵蓋的節點；用來組標題，並在通知關閉後清空重來
			notifBatch: [],
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
			// 一次生成動作算一次共用額度（不論連動幾個節點）
			this.aiQuotaState.used = Math.min(this.aiQuotaState.used + 1, this.aiQuotaState.limit);
			if (!SHARED_MATERIAL_FIELD_IDS.includes(sourceId)) {
				return;
			}
			// 共用素材：重新生成一律連動全部三個節點（不論先前狀態）一起進入生成中、重置看過
			SHARED_MATERIAL_FIELD_IDS.forEach(id => {
				if (id === sourceId) {
					return;
				}
				this.aiFieldStatus[id] = 'generating';
				this.aiSeen[id] = false;
			});
		},
		handleFieldGenerated(sourceId) {
			// 觸發的節點此刻完成
			this.completeField(sourceId);
			if (!SHARED_MATERIAL_FIELD_IDS.includes(sourceId)) {
				// 行程管理等獨立流程：只有自己
				return;
			}
			// 其餘共用節點模擬「各自不同的生成時間」錯開陸續完成（真實情況三個不會同時好）；
			// 錯開完成也只會併進同一則 toast（見 notifyReady），不會連跳多則
			const others = SHARED_MATERIAL_FIELD_IDS.filter(
				id => id !== sourceId && this.aiFieldStatus[id] === 'generating',
			);
			others.forEach((id, i) => {
				setTimeout(() => this.completeField(id), (i + 1) * 900);
			});
		},
		// 單一節點完成：標成 ready；在當前節點完成＝已看過（不亮點不通知）；符合可提示規則就併入通知
		completeField(fieldId) {
			if (this.aiFieldStatus[fieldId] !== 'generating') {
				return;
			}
			this.aiFieldStatus[fieldId] = 'ready';
			if (fieldId === this.currentNode) {
				this.aiSeen[fieldId] = true;
			}
			if (this.isNotifiable(fieldId)) {
				this.notifyReady(fieldId);
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
		// 無 CTA 的完成通知，用 antd notification 呈現。「一次生成只有一則」：各節點錯開完成時
		// 用固定 key 原地更新、累加節點名稱並重設自動消失倒數，不會連跳多則；關閉後清空 batch 重來
		notifyReady(fieldId) {
			if (!this.notifBatch.includes(fieldId)) {
				this.notifBatch.push(fieldId);
			}
			// 文案三欄位是「連動生成的其他欄位」，用「也幫你準備好…」框定為額外欄位（你正在做的那欄
			// 會直接看到結果、不進通知）；行程管理是獨立生成、沒有連動的其他欄位，依 Figma node
			// 2160:33356 用「已幫你準備好「行程介紹」了」＋更具體的前往指引。
			const scheduleOnly = this.notifBatch.length === 1 && this.notifBatch[0] === 'productPkgSchedule';
			let message;
			let description;
			if (scheduleOnly) {
				message = '已幫你準備好「行程介紹」了';
				description = '可點擊左側行程管理前往查看';
			} else {
				const names = this.notifBatch.map(id => `「${AI_FIELD_META[id].label}」`).join('');
				message = `也幫你準備好${names}的建議了`;
				description = '可點擊左側選單標記的節點前往查看';
			}
			notification.open({
				key: NOTIF_KEY,
				message,
				description,
				icon: h('span', {
					style: 'display:inline-flex;color:#722ed1',
					innerHTML: `<svg viewBox="0 0 16 16" width="24" height="24" fill="currentColor">${ICON_SPARKLE}</svg>`,
				}),
				placement: 'bottomRight',
				duration: NOTIF_DURATION,
				onClose: () => {
					this.notifBatch = [];
				},
			});
		},
	},
};
</script>
