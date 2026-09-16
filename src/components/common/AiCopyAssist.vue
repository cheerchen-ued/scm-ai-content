<template>
	<div
		class="ai-copy-assist"
		:class="{ 'inline-mode': inline }">
		<div
			v-if="inline || state === 'idle'"
			class="ai-trigger"
			:class="{ inline }"
			@click="handleTriggerClick">
			<svg
				viewBox="0 0 16 16"
				fill="currentColor"
				v-html="icons.sparkle" />
			AI 幫寫
		</div>

		<transition
			:css="false"
			@before-enter="onExpandBeforeEnter"
			@enter="onExpandEnter"
			@leave="onExpandLeave">
			<div
				v-if="feedback.visible"
				class="ai-feedback"
				:class="{ 'fb-card': feedback.phase === 'reasons' }">
				<template v-if="feedback.phase === 'ask'">
					<span class="fb-ask-text">這個「{{ fieldLabel }}」建議對您有幫助嗎？</span>
					<span class="fb-btn-group">
						<a-button
							class="fb-btn"
							@click="markSatisfied">
							<smile-two-tone />
							滿意
						</a-button>
						<a-button
							class="fb-btn"
							@click="markUnsatisfied">
							<frown-two-tone />
							不滿意
						</a-button>
					</span>
				</template>
				<template v-else-if="feedback.phase === 'reasons'">
					<div class="fb-reasons-title">
						不滿意原因為何？（可複選）
					</div>
					<div class="fb-reasons-list">
						<button
							v-for="reason in feedbackReasonOptions"
							:key="reason"
							type="button"
							class="fb-reason-chip"
							:class="{ active: feedback.reasons.includes(reason) }"
							@click="toggleFeedbackReason(reason)">
							{{ reason }}
						</button>
					</div>
					<a-textarea
						v-model:value="feedback.text"
						class="fb-text-input"
						:auto-size="{ minRows: 2, maxRows: 4 }"
						:maxlength="50"
						show-count
						placeholder="其他回饋" />
					<div class="fb-submit-row">
						<a-button
							type="text"
							class="fb-skip-btn"
							@click="skipFeedback">
							略過
						</a-button>
						<a-button @click="submitFeedback">
							送出回饋
						</a-button>
					</div>
				</template>
				<template v-else>
					<span class="fb-thanks">
						<check-outlined />
						感謝你的回饋！
					</span>
				</template>
			</div>
		</transition>

		<transition
			:css="false"
			@before-enter="onExpandBeforeEnter"
			@enter="onExpandEnter"
			@leave="onExpandLeave">
			<div
				v-if="state === 'panelOpen'"
				class="ai-panel">
				<div class="ai-panel-head">
					<svg
						viewBox="0 0 16 16"
						fill="currentColor"
						v-html="icons.sparkle" />
					AI 幫寫 · {{ fieldLabel }}
				</div>
				<div class="ai-panel-body">
					<label class="ai-field-label"><span class="required">*</span>行程重點、關鍵字或特色服務</label>
					<!-- 這個元件常被放在外層頁面「真正欄位」的 a-form-item 裡（例如商品名稱），
				用 no-style 包一層可以讓這個素材欄位有自己獨立的 Form.Item context，
				不會被外層 form-item 的 name/rules 誤認成同一個欄位而互相觸發驗證。 -->
					<a-form-item no-style>
						<a-textarea
							v-model:value="material"
							class="material-input"
							:auto-size="{ minRows: 3, maxRows: 6 }"
							show-count
							:maxlength="2000"
							placeholder="一段描述、幾個關鍵字或網址" />
					</a-form-item>
					<div
						v-if="otherFieldsSentence"
						class="prep-box">
						<div class="prep-title">
							以下欄位會一同生成
						</div>
						<div class="prep-caption">
							{{ otherFieldsSentence }}
						</div>
					</div>
					<div class="gen-row">
						<a-button @click="cancelPanel">
							取消
						</a-button>
						<a-button
							type="primary"
							class="btn-ai"
							:loading="generating"
							:disabled="quotaRemaining === 0"
							@click="generate">
							產生內容
						</a-button>
					</div>
					<div
						v-if="sharedAiQuota"
						class="quota-hint">
						{{ quotaRemaining > 0 ? `今日額度 ${sharedAiQuota.used} / ${sharedAiQuota.limit}` : '今日生成次數已用完，請明天再試' }}
					</div>
				</div>
			</div>
		</transition>

		<transition
			:css="false"
			@before-enter="onExpandBeforeEnter"
			@enter="onExpandEnter"
			@leave="onExpandLeave">
			<div
				v-if="state === 'ready'"
				class="ai-ready-block">
				<div class="arb-head">
					<svg
						viewBox="0 0 16 16"
						fill="currentColor"
						v-html="icons.sparkle" />
					已經幫你準備好{{ fieldLabel }}建議了
					<span class="arb-actions">
						<span
							class="arb-link"
							@click="openPanel">
							<svg
								viewBox="0 0 14 14"
								fill="currentColor"
								v-html="icons.reload" />
							重新生成
						</span>
						<close-outlined
							class="arb-close"
							@click="dismiss" />
					</span>
				</div>
				<div
					class="sugg-band"
					:class="{ 'has-prev-fade': !atStart, 'has-next-fade': !atEnd }">
					<div
						ref="track"
						class="sugg-track">
						<div
							v-for="(text, i) in suggestions"
							:key="i"
							class="sugg-item"
							:class="{ wide, applied: i === appliedIndex }"
							@click="apply(text)">
							<div class="idx">
								<check-outlined v-if="i === appliedIndex" />
								<template v-else>
									{{ String(i + 1).padStart(2, '0') }}
								</template>
							</div>
							<div
								class="txt"
								v-html="text" />
						</div>
					</div>
					<button
						type="button"
						class="sugg-chevron prev"
						:disabled="atStart"
						@click="scrollBy(-1)">‹</button>
					<button
						type="button"
						class="sugg-chevron next"
						:disabled="atEnd"
						@click="scrollBy(1)">›</button>
				</div>
				<div class="arb-disclaimer">
					<svg
						viewBox="0 0 14 14"
						fill="currentColor"
						v-html="icons.warning" />
					<span>文案內容由 AI 生成，僅供參考。請務必確認內容與實際提供之行程服務相符，如有落差請修改後再使用。</span>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
import {
	CheckOutlined, CloseOutlined, SmileTwoTone, FrownTwoTone,
} from '@ant-design/icons-vue';

// 不滿意時可複選的原因標籤，固定順序（依設計稿）
const FEEDBACK_REASON_OPTIONS = [
	'內容與商品不符', '與商品分類不符', '語意不通順', '格式不佳', '不符合 SEO', '多寫了未提供的資訊', '太籠統、無特色',
];

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

const ICON_RELOAD = '' +
	'<path d="M12.4289 2.86152L11.6578 3.46445C10.6064 2.12051 8.97128 1.25781 7.13515 1.25781C3.96464 1.25781 1.39843 3.82129 1.39433 6.99316C1.39023' +
	' 10.1678 3.96191 12.7422 7.13515 12.7422C9.61386 12.7422 11.7262 11.1699 12.5301 8.96738C12.5506 8.90996 12.5205 8.8457 12.4631 8.82656L11.6879' +
	' 8.55996C11.6609 8.5507 11.6313 8.55238 11.6055 8.56464C11.5797 8.5769 11.5597 8.59878 11.5498 8.62559C11.5252 8.69395 11.4978 8.7623 11.4691' +
	' 8.8293C11.2326 9.38984 10.8935 9.89297 10.4615 10.325C10.033 10.7544 9.52558 11.0969 8.96718 11.334C8.38886 11.5787 7.77226 11.7031 7.13788' +
	' 11.7031C6.50214 11.7031 5.8869 11.5787 5.30858 11.334C4.74964 11.0979 4.24207 10.7552 3.81425 10.325C3.38454 9.89651 3.04231 9.3885 2.80663' +
	' 8.8293C2.56191 8.24961 2.43749 7.63437 2.43749 6.99863C2.43749 6.36289 2.56191 5.74766 2.80663 5.16797C3.04315 4.60742 3.38222 4.1043 3.81425' +
	' 3.67227C4.24628 3.24023 4.7494 2.90117 5.30858 2.66328C5.8869 2.41855 6.50351 2.29414 7.13788 2.29414C7.77362 2.29414 8.38886 2.41855 8.96718' +
	' 2.66328C9.52612 2.89932 10.0337 3.24204 10.4615 3.67227C10.5969 3.80762 10.724 3.95117 10.8416 4.10156L10.0185 4.74414C10.0023 4.75674 9.98986' +
	' 4.77368 9.98278 4.79301C9.97569 4.81234 9.9742 4.83328 9.97849 4.85341C9.98277 4.87355 9.99265 4.89207 10.007 4.90684C10.0213 4.92161 10.0396' +
	' 4.93204 10.0596 4.93691L12.4603 5.5248C12.5287 5.54121 12.5957 5.48926 12.5957 5.41953L12.6066 2.94629C12.6053 2.85605 12.5 2.80547 12.4289' +
	' 2.86152V2.86152Z" />';

const ICON_WARNING = '' +
	'<path d="M7 0.875C3.61758 0.875 0.875 3.61758 0.875 7C0.875 10.3824 3.61758 13.125 7 13.125C10.3824 13.125 13.125 10.3824 13.125 7C13.125' +
	' 3.61758 10.3824 0.875 7 0.875ZM6.5625 4.04688C6.5625 3.98672 6.61172 3.9375 6.67188 3.9375H7.32812C7.38828 3.9375 7.4375 3.98672 7.4375' +
	' 4.04688V7.76562C7.4375 7.82578 7.38828 7.875 7.32812 7.875H6.67188C6.61172 7.875 6.5625 7.82578 6.5625 7.76562V4.04688ZM7 10.0625C6.82827' +
	' 10.059 6.66476 9.98831 6.54455 9.86562C6.42434 9.74294 6.35701 9.57801 6.35701 9.40625C6.35701 9.23449 6.42434 9.06956 6.54455 8.94688C6.66476' +
	' 8.82419 6.82827 8.75351 7 8.75C7.17173 8.75351 7.33524 8.82419 7.45545 8.94688C7.57566 9.06956 7.64299 9.23449 7.64299 9.40625C7.64299 9.57801' +
	' 7.57566 9.74294 7.45545 9.86562C7.33524 9.98831 7.17173 10.059 7 10.0625Z" />';

export default {
	name: 'AiCopyAssist',
	components: {
		CheckOutlined,
		CloseOutlined,
		SmileTwoTone,
		FrownTwoTone,
	},
	props: {
		fieldLabel: {
			type: String,
			required: true,
		},
		suggestions: {
			type: Array,
			required: true,
		},
		wide: {
			type: Boolean,
			default: false,
		},
		// 素材面板裡「準備欄位」列表：包含全部共用同一份素材的欄位（含這個欄位自己），順序
		// 固定不隨目前是哪個欄位而改變，每項為 {fieldId, label, step}；命中目前 fieldId 的那項
		// 會把 step 標籤換成「當前欄位」，其餘維持原本的 step 標籤，藉此讓清單順序保持穩定。
		prepFields: {
			type: Array,
			default: () => [],
		},
		// 選填：同一份素材會一併生成多個欄位時，用來跟共用的 sharedAiStatus/sharedAiActions 對接
		// （目前只有 preview 的 1-1/1-2/5-1 有傳入；正式頁面不傳，行為完全不變）
		fieldId: {
			type: String,
			default: null,
		},
		// 選填：這個欄位目前既有的內容（使用者自己填的、或先前已套用的文案）。
		// 第一次點開 AI 幫寫、素材欄位還是空的時候，會直接帶入這裡的內容當作素材起點；
		// 也用來即時比對「現在是不是還套用著某個建議」（見 appliedIndex）。
		existingContent: {
			type: String,
			default: '',
		},
		// 選填：是否以「輸入框右側常駐按鈕」的樣式呈現（例如商品名稱這種單欄輸入框）。
		// 為 true 時，按鈕不論任何狀態都會顯示，不會被素材面板/建議清單取代；
		// 面板/建議清單則由外層頁面用 CSS Grid 排到輸入框整排下方（見 PreviewBasicInfo.vue）。
		inline: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['apply'],
	inject: {
		sharedAiStatus: {default: null},
		sharedAiActions: {default: null},
		// 同一份素材共用的文字狀態（1-1/1-2/5-1 共用同一份，重新打開任一欄位的 AI 面板都看得到同一份素材）
		sharedAiMaterial: {default: null},
		// 一個帳號一天共用的生成額度（{used, limit}）；正式頁面沒有提供這個 context 時維持不顯示、不限制
		sharedAiQuota: {default: null},
		// 目前使用者停留在哪個節點（{current}）；用來判斷使用者是否已經離開這個欄位所在節點，
		// 離開就要收起套用建議後的滿意度回饋區塊。正式頁面沒有提供這個 context 時不影響原本行為。
		sharedActiveNode: {default: null},
	},
	data() {
		return {
			state: 'idle', // idle | panelOpen | ready
			localMaterial: '',
			// 是否已經在本機生成過一次建議（給沒有 fieldId/共用狀態的正式頁面用的本機記憶）
			hasGeneratedOnce: false,
			generating: false,
			atStart: true,
			atEnd: false,
			// 套用建議後的輕量回饋機制：ask（詢問滿意度）→ reasons（不滿意的原因清單）/ thanks（感謝訊息）
			feedback: {
				visible: false,
				phase: 'ask',
				reasons: [],
				text: '',
				appliedText: '',
			},
			feedbackReasonOptions: FEEDBACK_REASON_OPTIONS,
			icons: {
				sparkle: ICON_SPARKLE,
				reload: ICON_RELOAD,
				warning: ICON_WARNING,
			},
		};
	},
	computed: {
		externalStatus() {
			return this.fieldId && this.sharedAiStatus ? this.sharedAiStatus[this.fieldId] : null;
		},
		// 這個欄位是不是已經有「準備好的建議」可以看：本機生成過，或者透過共用素材連動、
		// 或整頁重新整理後由 externalStatus 得知已經生成/套用過，都算
		hasSuggestionsReady() {
			return this.hasGeneratedOnce || this.externalStatus === 'ready' || this.externalStatus === 'applied';
		},
		quotaRemaining() {
			return this.sharedAiQuota ? Math.max(this.sharedAiQuota.limit - this.sharedAiQuota.used, 0) : null;
		},
		// 「以下欄位會一同生成」的說明文字：只列出「其他」共用素材的欄位（不含自己，
		// 因為上面的面板標題已經寫了目前是哪個欄位），依 Figma node 2033:16143 格式
		// 寫成一句話，例如「商品亮點（STEP 1-2）、商品說明（STEP 5-1）欄位會一起用
		// 這份素材生成，切換到對應頁面即可查看與套用建議。」
		otherFieldsSentence() {
			const others = this.prepFields.filter(field => !(field.fieldId && field.fieldId === this.fieldId));
			if (!others.length) return '';
			const parts = others.map(field => {
				const shortStep = (field.step || '').split(' · ')[0];
				return shortStep ? `${field.label}（${shortStep}）` : field.label;
			});
			return `${parts.join('、')}欄位會一起用這份素材生成，切換到對應頁面即可查看與套用建議。`;
		},
		// 即時比對「欄位現在的內容」跟哪一個建議一字不差：不是記錄「歷史上點過哪個」，
		// 而是每次都重新比對，這樣使用者套用後若又編輯過、或整個刪掉，勾勾會自動消失，
		// 不會誤導成「現在還是套用著這個」。
		appliedIndex() {
			const current = (this.existingContent || '').trim();
			if (!current) return null;
			const idx = this.suggestions.findIndex(text => text.replace(/<[^>]+>/g, '').trim() === current);
			return idx >= 0 ? idx : null;
		},
		material: {
			get() {
				return this.fieldId && this.sharedAiMaterial ? this.sharedAiMaterial.text : this.localMaterial;
			},
			set(value) {
				if (this.fieldId && this.sharedAiMaterial) {
					this.sharedAiMaterial.text = value;
				} else {
					this.localMaterial = value;
				}
			},
		},
		// 使用者目前是不是還停留在這個欄位所在的節點；沒有提供 sharedActiveNode context
		// （例如正式頁面）或沒有 fieldId 時，視為一直都在，不影響回饋區塊的行為
		isFieldActive() {
			if (!this.sharedActiveNode || !this.fieldId) return true;
			return this.sharedActiveNode.current === this.fieldId;
		},
	},
	watch: {
		// 同一份素材連動生成好之後，其他共用欄位只要還是 idle（使用者還沒手動關掉過），
		// 就直接自動顯示建議，不用使用者自己點開「AI 幫寫」才看得到
		externalStatus(value) {
			if (value === 'ready' && this.state === 'idle') {
				this.state = 'ready';
			}
		},
		state(value) {
			if (value === 'ready') {
				this.hasGeneratedOnce = true;
				this.$nextTick(() => {
					this.updateNavState();
					this.bindTrackScroll();
				});
			}
			// 重新打開 AI 幫寫（不管是進素材畫面還是直接看建議）就收起回饋區塊，避免跟新一輪操作擠在一起
			if (value !== 'idle' && this.feedback.visible) {
				this.hideFeedback();
			}
		},
		// 套用建議後回饋區塊才會出現；一旦欄位內容跟當初套用的不一樣了（使用者自己改過或清空），
		// 代表回饋的對象已經不存在，要跟著收起，不能繼續掛著一個過時的回饋詢問
		existingContent(value) {
			if (this.feedback.visible && (value || '').trim() !== this.feedback.appliedText) {
				this.hideFeedback();
			}
		},
		// 使用者離開這個欄位所在的節點時，回饋區塊也要收起
		isFieldActive(value) {
			if (!value && this.feedback.visible) {
				this.hideFeedback();
			}
		},
	},
	created() {
		// 保險：萬一元件是在 externalStatus 已經是 ready 之後才建立的（例如未來改回非常駐掛載），
		// 一樣要直接顯示建議，而不是卡在 idle 入口
		if (this.externalStatus === 'ready' && this.state === 'idle') {
			this.state = 'ready';
		}
	},
	methods: {
		// 「AI 幫寫」小按鈕入口：已經有準備好的建議（不管有沒有套用過）就直接看建議，
		// 不用重新輸入素材；從沒生成過才進到素材輸入畫面
		handleTriggerClick() {
			// inline 模式下按鈕會常駐顯示，面板/建議清單展開時再點一次要能收回去
			// （真正的開關切換），不是點了沒反應
			if (this.state === 'panelOpen') {
				this.cancelPanel();
				return;
			}
			if (this.state === 'ready') {
				this.dismiss();
				return;
			}
			if (this.hasSuggestionsReady) {
				this.state = 'ready';
				return;
			}
			this.openPanel();
		},
		// 一律進素材輸入畫面：「重新生成」連結會用到，代表使用者明確要產生全新一批
		openPanel() {
			this.state = 'panelOpen';
			if (!this.material && this.existingContent) {
				this.material = this.existingContent.replace(/<[^>]+>/g, '');
			}
		},
		// 建議區塊右上角的關閉按鈕：單純把畫面收回「AI 幫寫」入口，不影響已生成/已套用的內容，
		// 之後點「AI 幫寫」還是會直接看到同一批建議
		dismiss() {
			this.state = 'idle';
		},
		cancelPanel() {
			// 已經有準備好的建議，取消（放棄重新生成）一律回到 ready 保留既有建議；
			// 從沒生成過才回到 idle 入口
			this.state = this.hasSuggestionsReady ? 'ready' : 'idle';
		},
		generate() {
			this.generating = true;
			if (this.fieldId && this.sharedAiActions) {
				this.sharedAiActions.generating(this.fieldId);
			}
			setTimeout(() => {
				this.generating = false;
				this.state = 'ready';
				if (this.fieldId && this.sharedAiActions) {
					this.sharedAiActions.generated(this.fieldId);
				}
			}, 1200);
		},
		apply(text) {
			const plainText = text.replace(/<[^>]+>/g, '');
			this.$emit('apply', plainText);
			// 套用後退回「AI 幫寫」入口；下次點開會直接看到這批建議，套用過的那個會顯示
			// 勾勾（用即時比對判斷，見 appliedIndex），不需要重新生成
			this.state = 'idle';
			if (this.fieldId && this.sharedAiActions) {
				this.sharedAiActions.applied(this.fieldId);
			}
			this.showFeedback(plainText.trim());
		},
		// 套用建議後出現的輕量回饋機制：不能打斷使用者，所以只是欄位下方多一小塊，
		// 使用者做任何更動（重新打開 AI/欄位內容變了）或離開這個節點都會自動收起（見對應 watch）
		showFeedback(appliedText) {
			this.feedback = {
				visible: true,
				phase: 'ask',
				reasons: [],
				text: '',
				appliedText,
			};
		},
		hideFeedback() {
			this.feedback.visible = false;
		},
		// 略過：使用者不想提供不滿意的細節，直接收起回饋區塊，不顯示感謝訊息
		// （沒有實際送出任何回饋內容，跟「感謝」的情境不同）
		skipFeedback() {
			this.hideFeedback();
		},
		markSatisfied() {
			this.feedback.phase = 'thanks';
		},
		markUnsatisfied() {
			this.feedback.phase = 'reasons';
		},
		toggleFeedbackReason(reason) {
			const idx = this.feedback.reasons.indexOf(reason);
			if (idx >= 0) {
				this.feedback.reasons.splice(idx, 1);
			} else {
				this.feedback.reasons.push(reason);
			}
		},
		submitFeedback() {
			this.feedback.phase = 'thanks';
		},
		scrollBy(dir) {
			const el = this.$refs.track;
			if (!el) return;
			el.scrollBy({left: dir * el.clientWidth * 0.42, behavior: 'smooth'});
		},
		updateNavState() {
			const el = this.$refs.track;
			if (!el) return;
			// 尾端保留了 34px 給右側漸層/按鈕使用（見 .sugg-track 的 padding-right），
			// 加上 scroll-snap 只會停在卡片邊界，實際能捲到的最大距離不會等於 scrollWidth - clientWidth，
			// 容許誤差需要涵蓋這段保留空間，否則永遠判斷不到「已捲到底」。
			this.atStart = el.scrollLeft <= 4;
			this.atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 40;
		},
		bindTrackScroll() {
			const el = this.$refs.track;
			if (!el) return;
			el.addEventListener('scroll', this.updateNavState);
		},
		// 素材面板/建議清單/回饋區塊展開收合時，用實際內容高度做平滑的展開動畫，
		// 而不是直接跳轉；因為每個區塊內容高度都不固定（建議筆數、回饋階段不同），
		// 沒辦法寫死一個 CSS 高度，所以量測 scrollHeight 再套用動畫。用 Web Animations
		// API（el.animate）而不是手動切 CSS transition + 監聽 transitionend：後者
		// 若瀏覽器把「設 0 → 下一輪設目標值」這兩步優化成同一次繪製，會導致沒有真的
		// 產生 transition、transitionend 永遠不會觸發，動畫卡住；WAAPI 沒有這個問題。
		onExpandBeforeEnter(el) {
			el.style.overflow = 'hidden';
		},
		onExpandEnter(el, done) {
			// 這個元件所在的頁面如果目前被 v-show 隱藏（例如共用素材連動時，使用者
			// 正停留在別的節點），量到的高度一律是 0，直接呈現最終狀態就好，不用動畫
			if (el.offsetParent === null) {
				el.style.overflow = '';
				done();
				return;
			}
			const target = el.scrollHeight;
			const anim = el.animate(
				[{height: '0px', opacity: 0}, {height: `${target}px`, opacity: 1}],
				{duration: 220, easing: 'ease'},
			);
			anim.onfinish = () => {
				el.style.height = 'auto';
				el.style.overflow = '';
				done();
			};
		},
		onExpandLeave(el, done) {
			if (el.offsetParent === null) {
				done();
				return;
			}
			const start = el.scrollHeight;
			el.style.overflow = 'hidden';
			const anim = el.animate(
				[{height: `${start}px`, opacity: 1}, {height: '0px', opacity: 0}],
				{duration: 180, easing: 'ease'},
			);
			anim.onfinish = () => done();
		},
	},
	mounted() {
		this.$nextTick(() => {
			this.updateNavState();
			this.bindTrackScroll();
		});
	},
};
</script>

<style lang="scss" scoped>
.ai-copy-assist {
	margin-bottom: var(--space-margin-xs);

	// inline 模式讓外層頁面用 CSS Grid 直接排列這個元件底下的每個區塊
	// （常駐按鈕排在輸入框右邊，面板/建議清單排到整排下方），這層 wrapper 本身不佔版位。
	&.inline-mode {
		display: contents;
	}
}

.ai-trigger {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	width: fit-content;
	background: var(--colors-base-purple-1);
	color: var(--colors-base-purple-6);
	border: 1px solid var(--colors-base-purple-2);
	border-radius: var(--border-radius-sm);
	padding: 4px 12px 4px 8px;
	font-size: 12.5px;
	font-weight: 600;
	cursor: pointer;

	svg {
		width: 14px;
		height: 14px;
	}

	&.inline {
		height: 32px;
		box-sizing: border-box;
		flex-shrink: 0;
	}
}

// 套用建議後的輕量回饋機制。詢問滿意度／感謝訊息這兩個狀態比照設計稿是
// 素色列（不加卡片），但「不滿意」展開原因清單時，設計稿其實是有卡片
// 框住的（淺灰底 + 邊框 + 圓角），用 .fb-card 這個修飾類別單獨處理。
.ai-feedback {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--space-margin-xs);
	margin-top: var(--space-margin);

	&.fb-card {
		align-items: flex-start;
		background: var(--colors-neutral-fill-color-fill-quaternary);
		border: 1px solid var(--colors-neutral-border-color-border);
		border-radius: var(--border-radius-lg);
		padding: var(--space-margin-sm) var(--space-margin);
		gap: var(--space-margin-sm);
	}
}

.fb-ask-text {
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
}

// 按鈕緊跟在文案後面（只隔一個 row 的 gap），不要用 margin-left: auto
// 推到最右邊——那樣文案跟按鈕之間會空一大段，不符合設計稿。
.fb-btn-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

// 滿意/不滿意就是一般的 a-button（預設樣式：白底、灰框、黑字），只有圓角改成
// 膠囊形狀比照設計稿，不另外疊加品牌色——顏色交給 SmileTwoTone/FrownTwoTone
// 圖示本身的雙色表達，不是按鈕本身的顏色。
.fb-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	border-radius: 999px;
}

.fb-reasons-title {
	flex: 0 0 100%;
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-neutral-text-color-text);
}

.fb-reasons-list {
	flex: 0 0 100%;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.fb-reason-chip {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	background: var(--colors-neutral-color-bg-base);
	border: 1px solid var(--colors-neutral-border-color-border);
	border-radius: 20px;
	padding: 4px 12px;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
	cursor: pointer;

	// 選中純粹用顏色表達（邊框/文字變品牌藍），不加勾勾或其他圖示，比照設計稿實際用法
	&:hover {
		border-color: var(--colors-brand-primary-color-primary-border-hover);
		color: var(--colors-brand-primary-color-primary-hover);
	}

	&.active {
		background: var(--colors-brand-primary-color-primary-bg);
		border-color: var(--colors-brand-primary-color-primary);
		color: var(--colors-brand-primary-color-primary);

		&:hover {
			border-color: var(--colors-brand-primary-color-primary);
			color: var(--colors-brand-primary-color-primary);
		}
	}
}

.fb-text-input {
	flex: 0 0 100%;
}

.fb-submit-row {
	flex: 0 0 100%;
	display: flex;
	justify-content: flex-end;
	gap: 8px;
}

.fb-skip-btn {
	color: var(--colors-neutral-text-color-text);
}

.fb-thanks {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-brand-success-color-success);
}

.ai-panel {
	border: 1px solid var(--colors-base-purple-2);
	background: var(--colors-base-purple-1);
	border-radius: var(--border-radius-lg);
	overflow: hidden;
}

.ai-panel-head {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: var(--space-margin-sm) var(--space-margin);
	border-bottom: 1px solid var(--colors-base-purple-2);
	font-weight: 600;
	font-size: 14px;
	color: var(--colors-base-purple-6);

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}
}

// 依 Figma node 2033:16143：上下 padding 是同一個 --space-margin-sm（12px），
// 不是上 16px、下 24px 這種不對稱寫法。
.ai-panel-body {
	padding: var(--space-margin-sm) var(--space-margin);
	background: #fff;
}

// 依 Figma node 2033:16143：素材欄位／準備欄位／按鈕列這三個區塊之間的間距，
// 是同一個 --space-margin-lg（24px），不是隨便抓的視覺順眼值。
.material-input {
	margin-bottom: var(--space-margin-lg);
}

.ai-field-label {
	display: block;
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-neutral-text-color-text);
	margin-bottom: var(--space-margin-xs);

	.required {
		color: var(--colors-brand-error-color-error, #e65f50);
		margin-right: 2px;
	}
}

.prep-box {
	margin-top: 0;
}

.prep-title {
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-neutral-text-color-text);
	margin-bottom: var(--space-margin-xs);
}

.prep-caption {
	font-size: 14px;
	line-height: 1.55;
	color: var(--colors-neutral-text-color-text);
}

.gen-row {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	margin-top: var(--space-margin-lg);

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

// 剩餘生成次數的提示：直接放在按鈕下面、跟按鈕一樣靠右，維持跟「產生內容」
// 的視覺關聯（放在按鈕列左邊會離按鈕太遠）。字級比免責聲明（12px tertiary）
// 明顯一點，因為這個會直接影響使用者按不按得下「產生內容」，但還是遠比按鈕本身低調。
.quota-hint {
	margin-top: 2px;
	text-align: right;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text-secondary);
}

.ai-ready-block {
	background: var(--colors-base-purple-1);
	border: 1px solid var(--colors-base-purple-2);
	border-radius: var(--border-radius-lg);
	padding: var(--space-margin-sm) var(--space-margin);
}

.arb-head {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-base-purple-6);
	margin-bottom: var(--space-margin-sm);

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}
}

.arb-close {
	font-size: 14px;
	color: var(--colors-neutral-text-color-text-tertiary);
	cursor: pointer;
	padding: 5px;
	border-radius: var(--border-radius-sm);

	&:hover {
		background: rgba(0, 0, 0, 0.04);
		color: var(--colors-neutral-text-color-text);
	}
}

.arb-actions {
	margin-left: auto;
	display: flex;
	align-items: center;
	gap: 14px;
}

.arb-link {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
	cursor: pointer;
	padding: 0 7px;
	border-radius: var(--border-radius-sm);
	line-height: 22px;

	&:hover {
		background: rgba(0, 0, 0, 0.04);
	}

	svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}
}

.arb-disclaimer {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	font-size: 12px;
	color: var(--colors-neutral-text-color-text-tertiary);
	line-height: 1.4;
	margin-top: var(--space-margin-sm);

	svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: var(--colors-brand-warning-color-warning);
		margin-top: 1px;
	}
}

.sugg-band {
	position: relative;

	&::before,
	&::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 68px;
		pointer-events: none;
		opacity: 0;
		transition: opacity .12s;
	}

	&::before {
		left: 0;
		background: linear-gradient(to left, rgba(249, 240, 255, 0), var(--colors-base-purple-1) 65%);
	}

	&::after {
		right: 0;
		background: linear-gradient(to right, rgba(249, 240, 255, 0), var(--colors-base-purple-1) 65%);
	}

	&.has-prev-fade::before {
		opacity: 1;
	}

	&.has-next-fade::after {
		opacity: 1;
	}
}

.sugg-track {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	overflow-x: auto;
	scroll-snap-type: x mandatory;
	scrollbar-width: none;
	padding-right: 34px;

	&::-webkit-scrollbar {
		display: none;
	}
}

.sugg-item {
	position: relative;
	scroll-snap-align: start;
	flex: 0 0 320px;
	width: 320px;
	box-sizing: border-box;
	background: var(--colors-neutral-color-bg-base);
	border: 1px solid var(--colors-base-purple-2);
	border-radius: var(--border-radius-lg);
	padding: var(--space-margin-sm) var(--space-margin);
	cursor: pointer;
	display: flex;
	gap: 8px;
	align-items: flex-start;
	transition: border-color .12s, box-shadow .12s;

	&:hover {
		border-color: var(--colors-base-purple-6);
		box-shadow: 0 2px 10px rgba(114, 46, 209, .14);
	}

	&.wide {
		flex: 0 0 600px;
		width: 600px;
	}

	&.applied {
		border-color: var(--colors-base-purple-6);
		background: var(--colors-base-purple-1);
	}
}

.sugg-item.applied .idx {
	background: var(--colors-base-purple-6);
	color: #fff;
}

.sugg-item .idx {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	border-radius: 50%;
	font-size: 12px;
	font-weight: 600;
	color: var(--colors-neutral-text-color-text-quaternary);
	flex-shrink: 0;
}

.sugg-item .txt {
	font-size: 14px;
	line-height: 1.55;
	color: var(--colors-neutral-text-color-text-heading);
	max-height: 240px;
	overflow-y: auto;
	padding-right: 2px;
}

.sugg-chevron {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: var(--colors-neutral-color-bg-base);
	box-shadow: 0 1px 4px rgba(0, 0, 0, .18);
	color: var(--colors-neutral-text-color-text);
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	cursor: pointer;
	line-height: 1;
	padding: 0;
	z-index: 1;

	&.prev {
		left: 2px;
	}

	&.next {
		right: 2px;
	}

	&:disabled {
		opacity: 0;
		pointer-events: none;
	}
}
</style>
