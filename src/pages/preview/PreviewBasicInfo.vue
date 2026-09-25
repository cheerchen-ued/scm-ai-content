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
				<!-- 實驗版面「輸入框內建 AI」，依 Figma node 2109:39983 的流程：欄位本身常駐一顆
				AI 觸發鈕（用 antd Input 的 addonAfter 融進輸入框右邊，不是分開的按鈕），第一次
				點擊（從沒生成過）欄位會直接「變身」成 AI 幫寫卡片（有內容就帶入、沒有就空白），
				產生內容後建議卡直接接在同一張卡片下面（欄位還是保持變身狀態）；套用後欄位變回
				純輸入框＋回饋。之後只要再點一次觸發鈕，因為已經生成過，就不會再取代欄位，而是
				在純輸入框下方另外開一塊「已經幫你準備好建議」的清單（欄位保持原樣）；只有從這裡
				點「重新生成」，才會再次取代欄位、回到素材輸入畫面。 -->
				<div
					v-if="composeMode"
					class="name-compose">
					<template v-if="composeState === 'idle' || composeState === 'readyBelow'">
						<div class="compose-idle-wrap">
							<a-input
								ref="composeInputRef"
								v-model:value="formData.name"
								class="compose-plain-input"
								show-count
								:maxlength="500"
								placeholder="請輸入商品名稱" />
							<button
								type="button"
								class="compose-addon-trigger"
								@click="clickAddonTrigger">
								<svg
									viewBox="0 0 16 16"
									fill="currentColor"
									v-html="icons.sparkle" />
							</button>
						</div>
						<div
							v-if="composeState === 'idle'"
							class="name-caption">
							建議依照『體驗城市 + 行程 + 規格』的格式撰寫，並避免使用特殊符號。
						</div>
						<transition
							:css="false"
							@before-enter="onExpandBeforeEnter"
							@enter="onExpandEnter"
							@leave="onExpandLeave">
							<div
								v-if="composeState === 'readyBelow'"
								class="compose-ready-block">
								<div class="arb-head">
									<svg
										viewBox="0 0 16 16"
										fill="currentColor"
										v-html="icons.sparkle" />
									已經幫你準備好商品名稱建議
									<span class="arb-actions">
										<span
											class="arb-link"
											@click="reenterComposeFromBelow">
											<reload-outlined />
											重新生成
										</span>
										<close-outlined
											class="arb-close"
											@click="closeReadyBelow" />
									</span>
								</div>
								<div class="compose-suggestions">
									<button
										v-for="(text, i) in aiNameSuggestions"
										:key="i"
										type="button"
										class="compose-sugg-card"
										:class="{ applied: i === appliedIndex }"
										@click="applyComposeSuggestion(text)">
										<span class="compose-sugg-idx">
											<check-outlined v-if="i === appliedIndex" />
											<template v-else>
												{{ String(i + 1).padStart(2, '0') }}
											</template>
										</span>
										<span class="compose-sugg-text">{{ text }}</span>
									</button>
								</div>
								<div class="compose-ai-disclaimer">
									<exclamation-circle-filled />
									<span>文案內容由 AI 生成，僅供參考。請務必確認內容與實際提供之行程服務相符，如有落差請修改後再使用。</span>
								</div>
							</div>
						</transition>
					</template>
					<div
						v-else
						class="compose-ai-card">
						<div class="compose-ai-top">
							<div class="compose-ai-header">
								<svg
									viewBox="0 0 16 16"
									fill="currentColor"
									v-html="icons.sparkle" />
								<span>{{ composeState === 'ready' ? 'AI 幫寫' : 'AI 潤稿' }}</span>
							</div>
							<div class="compose-ai-question">
								您的行程重點、關鍵字或特色服務為何呢？
							</div>
							<!-- 這個素材欄位跟外層「商品名稱」a-form-item 共用同一個 <a-form>，用
							no-style 包一層讓它有自己獨立的 Form.Item context，不會在欄位被取代
							（真正的 name 輸入框 v-if 掉了）的時候被誤認成同一個欄位觸發 required
							驗證——跟 AiCopyAssist.vue 的素材欄位是同樣的處理方式。 -->
							<a-form-item no-style>
								<a-textarea
									v-model:value="composeDraft"
									class="compose-ai-textarea"
									:class="{ 'is-generating': composeState === 'generating' }"
									:auto-size="{ minRows: 2, maxRows: 6 }"
									:maxlength="2000"
									show-count
									:disabled="composeState === 'generating'"
									placeholder="輸入行程重點、關鍵字或特色服務" />
							</a-form-item>
							<div class="compose-ai-caption">
								輸入行程重點、關鍵字或特色服務
							</div>
						</div>
						<div class="compose-ai-action">
							<div
								v-if="sharedAiQuota"
								class="compose-ai-quota">
								{{ quotaRemaining > 0 ? `今日額度 ${sharedAiQuota.used} / ${sharedAiQuota.limit}` : '今日生成次數已用完，請明天再試' }}
							</div>
							<a-button
								:disabled="composeState === 'generating'"
								@click="cancelCompose">
								取消
							</a-button>
							<a-button
								type="primary"
								class="btn-ai"
								:loading="composeState === 'generating'"
								:disabled="quotaRemaining === 0"
								@click="triggerComposeGenerate">
								產生內容
							</a-button>
						</div>
						<template v-if="composeState === 'ready'">
							<div class="compose-suggestions">
								<button
									v-for="(text, i) in aiNameSuggestions"
									:key="i"
									type="button"
									class="compose-sugg-card"
									:class="{ applied: i === appliedIndex }"
									@click="applyComposeSuggestion(text)">
									<span class="compose-sugg-idx">
										<check-outlined v-if="i === appliedIndex" />
										<template v-else>
											{{ String(i + 1).padStart(2, '0') }}
										</template>
									</span>
									<span class="compose-sugg-text">{{ text }}</span>
								</button>
							</div>
							<div class="compose-ai-disclaimer">
								<exclamation-circle-filled />
								<span>文案內容由 AI 生成，僅供參考。請務必確認內容與實際提供之行程服務相符，如有落差請修改後再使用。</span>
							</div>
						</template>
					</div>
					<transition
						:css="false"
						@before-enter="onExpandBeforeEnter"
						@enter="onExpandEnter"
						@leave="onExpandLeave">
						<div
							v-if="feedback.visible"
							class="compose-feedback"
							:class="{ 'fb-card': feedback.phase === 'reasons' }">
							<template v-if="feedback.phase === 'ask'">
								<span class="fb-ask-text">這個「商品名稱」建議對您有幫助嗎？</span>
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
								<a-form-item no-style>
									<a-textarea
										v-model:value="feedback.text"
										class="fb-text-input"
										:auto-size="{ minRows: 2, maxRows: 4 }"
										:maxlength="50"
										show-count
										placeholder="其他回饋" />
								</a-form-item>
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
				</div>
				<div
					v-else
					class="name-field-grid">
					<a-input
						ref="nameInput"
						v-model:value="formData.name"
						class="name-input"
						show-count
						:maxlength="500"
						:disabled="aiFieldDisabled"
						placeholder="請輸入商品名稱" />
					<ai-copy-assist
						inline
						field-label="商品名稱"
						field-id="productBasicInfo"
						:suggestions="aiNameSuggestions"
						:prep-fields="aiPrepFields"
						:existing-content="formData.name"
						@apply="onAiApplyName"
						@update:field-disabled="aiFieldDisabled = $event"
						@update:panel-active="aiPanelActive = $event" />
					<!-- 欄位原本的說明文字（caption）要緊跟在輸入框下面，不能被 AI 面板/建議清單
					隔開，所以直接排進 grid 裡（不用 a-form-item 的 #extra，那個永遠排在最後面）。
					依 Figma node 2108:26356：AI 面板/建議清單顯示的時候（panelOpen、ready），
					這段說明文字要讓出來，回到 idle（不管是從沒生成過、還是套用完畢）才恢復顯示。 -->
					<div
						v-if="!aiPanelActive"
						class="name-caption">
						建議依照『體驗城市 + 行程 + 規格』的格式撰寫，並避免使用特殊符號。
					</div>
				</div>
			</a-form-item>
		</div>
	</a-form>
</template>

<script>
import {
	ExclamationCircleFilled, CheckOutlined, CloseOutlined, ReloadOutlined, SmileTwoTone, FrownTwoTone,
} from '@ant-design/icons-vue';
import AiCopyAssist from 'components/common/AiCopyAssist';

// 不滿意時可複選的原因標籤，跟 AiCopyAssist.vue 共用同一份順序（依設計稿）
const FEEDBACK_REASON_OPTIONS = [
	'內容與商品不符', '與商品分類不符', '語意不通順', '格式不佳', '不符合 SEO', '多寫了未提供的資訊', '太籠統、無特色',
];

// AI 幫寫的星芒圖示，跟 AiCopyAssist.vue 的 ICON_SPARKLE 是同一份（依 Figma「Icon/GenerateText」），
// 不是 ant-design 內建的 ThunderboltOutlined（那是閃電圖示，跟設計稿的星芒圖示外觀不同）
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
	name: 'PreviewBasicInfo',
	components: {
		AiCopyAssist,
		ExclamationCircleFilled,
		CheckOutlined,
		CloseOutlined,
		ReloadOutlined,
		SmileTwoTone,
		FrownTwoTone,
	},
	// 實驗性版面切換（見 PreviewChrome 的開關）：'current' 是目前上線的版本，不用理會這個 context
	inject: {
		sharedAiVariant: {default: null},
		sharedAiQuota: {default: null},
		sharedAiActions: {default: null},
		sharedAiMaterial: {default: null},
		// 商品名稱/商品亮點/商品說明共用同一份素材，任一欄位生成後，其他欄位要連動變成
		// 「已經幫你準備好建議」，不用使用者自己重新生成一次；見 externalStatus + 對應 watch。
		sharedAiStatus: {default: null},
	},
	data() {
		return {
			formData: {
				name: '',
			},
			// AiCopyAssist 素材輸入畫面開著時，透過 update:fieldDisabled 通知這裡要 disable
			// 真實欄位（見該元件 isComposingMaterial 的說明），只影響「目前版本」（非 compose）
			aiFieldDisabled: false,
			// AiCopyAssist 面板/建議清單顯示中（見該元件 isPanelActive 的說明），透過
			// update:panelActive 通知這裡要收起欄位原本的說明文字
			aiPanelActive: false,
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
			// 「輸入框內建 AI」實驗版面專用的狀態，完全不經過 AiCopyAssist，這個版面直接手刻：
			// idle（純輸入框＋常駐觸發鈕，欄位可能是空的、也可能還沒套用過任何建議）｜
			// composing／generating／ready（欄位「變身」成 AI 幫寫卡片，取代掉純輸入框；
			// ready 時卡片下方接著顯示垂直建議卡，欄位仍維持變身狀態，直到套用或取消）｜
			// readyBelow（欄位變回純輸入框，下方另外顯示「已經幫你準備好建議」清單，不取代
			// 欄位——只有從沒生成過，第一次點觸發鈕才會進 composing；已經生成過，點觸發鈕
			// 一律先進 readyBelow，只有從這裡點「重新生成」才會再次進 composing 取代欄位）
			composeState: 'idle',
			composeDraft: '',
			// 是否已經生成過一次建議；決定點觸發鈕時要不要直接跳 readyBelow
			hasGeneratedOnce: false,
			// 套用建議後的輕量回饋機制，跟 AiCopyAssist.vue 是同一套邏輯（這個版面沒有共用元件
			// 可以直接拿，複製一份過來）
			feedback: {
				visible: false,
				phase: 'ask',
				reasons: [],
				text: '',
			},
			feedbackReasonOptions: FEEDBACK_REASON_OPTIONS,
			icons: {
				sparkle: ICON_SPARKLE,
			},
		};
	},
	computed: {
		composeMode() {
			return this.sharedAiVariant?.mode === 'inline-compose';
		},
		quotaRemaining() {
			return this.sharedAiQuota ? Math.max(this.sharedAiQuota.limit - this.sharedAiQuota.used, 0) : null;
		},
		// 即時比對「欄位現在的內容」跟哪一個建議一字不差：不是記錄「歷史上點過哪個」，而是每次
		// 都重新比對，這樣使用者套用後若又編輯過、或整個刪掉，都能判斷出「套用的內容已經被改過」，
		// 跟 AiCopyAssist.vue 的 appliedIndex 是同一套邏輯。
		appliedIndex() {
			const current = (this.formData.name || '').trim();
			if (!current) return null;
			const idx = this.aiNameSuggestions.findIndex(text => text.trim() === current);
			return idx >= 0 ? idx : null;
		},
		// 跟 AiCopyAssist.vue 的 externalStatus 是同一套邏輯：商品亮點/商品說明任一個先生成，
		// 這裡看到的就是 'ready'，不用等使用者自己在這個欄位也按一次產生內容。
		externalStatus() {
			return this.sharedAiStatus ? this.sharedAiStatus.productBasicInfo : null;
		},
	},
	watch: {
		// 同一份素材連動生成好之後，只要這個欄位還是 idle（使用者還沒手動點開過），就直接
		// 跳 readyBelow（欄位保持原樣，下方多一塊「已經幫你準備好建議」），不會取代掉欄位——
		// 使用者根本沒有主動觸發這次生成，貿然取代他正在看的欄位是不合理的。
		externalStatus(value) {
			if (value === 'ready' && this.composeState === 'idle') {
				this.hasGeneratedOnce = true;
				this.composeState = 'readyBelow';
			}
		},
	},
	created() {
		// 保險：萬一元件是在 externalStatus 已經是 ready 之後才建立的，一樣要直接跳
		// readyBelow，不是卡在 idle
		if (this.externalStatus === 'ready' && this.composeState === 'idle') {
			this.hasGeneratedOnce = true;
			this.composeState = 'readyBelow';
		}
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
		// 輸入框右邊常駐的觸發鈕：從沒生成過，點下去直接取代欄位進素材輸入畫面（把欄位
		// 目前的內容帶進去當起點，沒內容就空白）；已經生成過，點下去不取代欄位，改成在
		// 下方開出「已經幫你準備好建議」清單（readyBelow），要重新生成才會再次取代欄位。
		clickAddonTrigger() {
			if (this.composeState === 'readyBelow') {
				this.closeReadyBelow();
				return;
			}
			if (this.hasGeneratedOnce) {
				this.composeState = 'readyBelow';
				return;
			}
			this.composeDraft = this.formData.name;
			this.composeState = 'composing';
		},
		// readyBelow 清單裡的「重新生成」：再次取代欄位進素材輸入畫面，素材一律重新帶入
		// 欄位「當下」的內容（不管是套用後又手動改過、還是套用了不同的建議，都要反映最新狀態）
		reenterComposeFromBelow() {
			this.composeDraft = this.formData.name;
			this.composeState = 'composing';
		},
		// readyBelow 清單右上角的關閉按鈕：純輸入框保留原樣，只是把清單收起來
		closeReadyBelow() {
			this.composeState = 'idle';
		},
		// 取消：欄位變回純輸入框，原本的內容完全不受影響（展開期間打的字都在 composeDraft
		// 這個暫存欄位，從來沒有寫回 formData.name）；已經生成過建議的話，取消要保留建議
		// （回到 readyBelow 讓使用者還看得到），不是整個丟掉
		cancelCompose() {
			this.composeState = this.hasGeneratedOnce ? 'readyBelow' : 'idle';
			this.composeDraft = '';
		},
		// 生成完後同一份文字也寫回共用素材，讓商品亮點/商品說明可以背景連動生成；生成完
		// 還是維持 composeState 取代欄位中（ready），建議卡直接接在同一張卡片下面，
		// 使用者可以繼續編輯素材、按產生內容重新生成，或直接點某則建議套用
		triggerComposeGenerate() {
			if (this.composeState === 'generating') return;
			this.composeState = 'generating';
			if (this.sharedAiMaterial) {
				this.sharedAiMaterial.text = this.composeDraft;
			}
			if (this.sharedAiActions) {
				this.sharedAiActions.generating('productBasicInfo');
			}
			setTimeout(() => {
				this.composeState = 'ready';
				this.hasGeneratedOnce = true;
				if (this.sharedAiActions) {
					this.sharedAiActions.generated('productBasicInfo');
				}
			}, 1200);
		},
		// 套用建議：不管是從取代欄位中的 ready、還是從下方的 readyBelow 清單點的，
		// 都是同一個動作——欄位變回純輸入框、寫入套用的文案、顯示回饋
		applyComposeSuggestion(text) {
			this.formData.name = text;
			this.composeState = 'idle';
			this.composeDraft = '';
			if (this.sharedAiActions) {
				this.sharedAiActions.applied('productBasicInfo');
			}
			this.$nextTick(() => {
				const inputEl = this.$refs.composeInputRef?.$el;
				if (!inputEl) return;
				inputEl.classList.remove('ai-applied-flash');
				// eslint-disable-next-line no-void
				void inputEl.offsetWidth;
				inputEl.classList.add('ai-applied-flash');
			});
			this.showFeedback();
		},
		showFeedback() {
			this.feedback = {
				visible: true, phase: 'ask', reasons: [], text: '',
			};
		},
		hideFeedback() {
			this.feedback.visible = false;
		},
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
		// 跟 AiCopyAssist.vue 同一套展開/收合動畫寫法（量測 scrollHeight + Web Animations
		// API），這裡是獨立手刻的版面，沒有共用元件可以直接拿，所以複製一份邏輯過來。
		onExpandBeforeEnter(el) {
			el.style.overflow = 'hidden';
		},
		onExpandEnter(el, done) {
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
	font-size: 14px;
	color: var(--colors-neutral-text-color-text-tertiary);
}

.name-field-grid .name-caption {
	grid-column: 1 / -1;
	grid-row: 2;
}

:deep(.ai-panel),
:deep(.ai-ready-block) {
	grid-column: 1 / -1;
	grid-row: 3;
}

// 回饋區塊排在建議清單（grid-row 3）下方，避免兩者同時出現時重疊
// （依 Figma 回饋機制：一生成建議即顯示，會與 ready 區塊並存）
:deep(.ai-feedback) {
	grid-column: 1 / -1;
	grid-row: 4;
}

// 實驗版面「輸入框內建 AI」，依 Figma node 2107:302371
.name-compose {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-xs);
}

// idle：純輸入框 + 常駐的 AI 觸發鈕，融合成同一個組件外觀（輸入框只留左側圓角，
// 觸發鈕只留右側圓角、貼著輸入框右邊、淺紫底），比照「套用建議」狀態的欄位樣式。
.compose-idle-wrap {
	display: flex;
	align-items: stretch;
}

.compose-plain-input {
	border-top-right-radius: 0;
	border-bottom-right-radius: 0;

	&:deep(.ant-input) {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
}

// 依 Figma node 2056:267630（antd Input / Pre Post Tab 的 addonAfter）：32px 寬、
// 淺紫底，只留右側圓角（跟 --border-radius 的 6px 對齊，不是 border-radius-base
// ——這個 token 在這個專案的 foundation.css 裡根本不存在），圖示是 14px。
.compose-addon-trigger {
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 32px;
	background: var(--colors-base-purple-1);
	color: var(--colors-base-purple-6);
	border: 1px solid var(--colors-neutral-border-color-border);
	border-left: none;
	border-top-right-radius: var(--border-radius);
	border-bottom-right-radius: var(--border-radius);
	cursor: pointer;

	&:hover {
		background: var(--colors-base-purple-2);
	}

	svg {
		width: 14px;
		height: 14px;
	}
}

// AI 幫寫卡片：composing／generating／ready 共用同一個外框，比照 Figma
// node 2105:290453（帶入欄位內容）/ 2056:267864（輸入素材）/ 2056:268188（產生內容）
.compose-ai-card {
	display: flex;
	flex-direction: column;
	gap: var(--space-margin-lg);
	padding: var(--space-margin-sm) var(--space-margin) var(--space-margin);
	background: var(--colors-base-purple-1);
	border-radius: var(--border-radius-lg);
}

.compose-ai-top {
	display: flex;
	flex-direction: column;
}

.compose-ai-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: var(--space-margin-xs);
	font-size: 14px;
	font-weight: 600;
	color: var(--colors-base-purple-6);

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}
}

// 依 Figma node 2105:290465：header（AI 潤稿/AI 幫寫）下面還有一行獨立的問句
// 標籤（一般字重、黑色，不是紫色的 header 文字），才接到輸入框本身。
.compose-ai-question {
	margin-bottom: var(--space-margin-xs);
	font-size: 14px;
	font-weight: 400;
	color: var(--colors-neutral-text-color-text);
}

.compose-ai-textarea {
	transition: box-shadow .2s ease;

	&.is-generating {
		animation: compose-pulse 1.1s ease-in-out infinite;
	}
}

@keyframes compose-pulse {
	0%,
	100% {
		box-shadow: 0 0 0 1px var(--colors-base-purple-2);
	}

	50% {
		box-shadow: 0 0 0 2px var(--colors-base-purple-4);
	}
}

.compose-ai-caption {
	margin-top: var(--space-margin-xxs);
	font-size: 14px;
	line-height: 1.55;
	color: var(--colors-neutral-text-color-text-tertiary);
}

.compose-ai-action {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: var(--space-margin);

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

.compose-ai-quota {
	flex: 1;
	text-align: right;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
}

// 依 Figma node 2109:38071（再次點擊 ai，保留先前建議）：欄位維持純輸入框，這塊
// 清單獨立顯示在下方——外框樣式（淺紫底+邊框）跟「目前版本」AiCopyAssist.vue 的
// .ai-ready-block 是同一份，這裡沒有共用元件可以直接拿，複製一份過來。
.compose-ready-block {
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
	margin-bottom: var(--space-margin-xs);

	svg {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
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
	border-radius: var(--border-radius);
	line-height: 22px;

	&:hover {
		background: rgba(0, 0, 0, 0.04);
	}
}

.arb-close {
	font-size: 14px;
	color: var(--colors-neutral-text-color-text-tertiary);
	cursor: pointer;
	padding: 5px;
	border-radius: var(--border-radius);

	&:hover {
		background: rgba(0, 0, 0, 0.04);
		color: var(--colors-neutral-text-color-text);
	}
}

// 建議清單：垂直堆疊的卡片（不是水平捲動的 pill），比照 Figma node 2056:268188。
// 「取代欄位中已產生建議」（composeState === 'ready'）跟「readyBelow 清單」
// 兩種情境視覺上完全一樣，共用同一套樣式。
.compose-suggestions {
	display: flex;
	flex-direction: column;
	gap: 8px;
	overflow: hidden;
}

.compose-sugg-card {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	padding: 12px;
	background: var(--colors-neutral-color-bg-base);
	border: 1px solid var(--colors-base-purple-3);
	border-radius: var(--border-radius-lg);
	text-align: left;
	cursor: pointer;
	transition: border-color .12s, box-shadow .12s;

	&:hover {
		border-color: var(--colors-base-purple-6);
		box-shadow: 0 2px 10px rgba(114, 46, 209, .14);
	}

	// 目前欄位內容跟這則建議一字不差，代表這就是現在套用中的那則（appliedIndex 比對出來的）
	&.applied {
		border-color: var(--colors-base-purple-6);
		background: var(--colors-base-purple-1);
	}
}

.compose-sugg-card.applied .compose-sugg-idx {
	color: var(--colors-base-purple-6);
}

.compose-sugg-idx {
	flex-shrink: 0;
	width: 20px;
	font-size: 12px;
	font-weight: 600;
	line-height: 20px;
	text-align: center;
	color: var(--colors-neutral-text-color-text-quaternary);
}

.compose-sugg-text {
	flex: 1;
	font-size: 14px;
	line-height: 1.55;
	color: var(--colors-neutral-text-color-text-heading);
}

.compose-ai-disclaimer {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	font-size: 12px;
	line-height: 1.4;
	color: var(--colors-neutral-text-color-text-tertiary);

	:deep(svg) {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		margin-top: 1px;
	}
}

// 套用建議後的輕量回饋機制，跟 AiCopyAssist.vue 的 .ai-feedback 是同一套樣式
.compose-feedback {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: var(--space-margin-xs);

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

.fb-btn-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

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
