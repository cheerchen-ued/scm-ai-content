<template>
	<div class="preview-chrome">
		<div class="app-header">
			<div class="header-logo">
				<img
					:src="`${logoBaseUrl}images/scm_logo_white.png`"
					alt="kkday.com">
			</div>
			<div class="header-city-select">
				<span>築地市場</span>
				<down-outlined />
			</div>
			<div class="header-spacer" />
			<div class="header-icons">
				<span class="header-icon-btn"><global-outlined /></span>
				<span class="header-icon-btn"><book-outlined /></span>
				<span class="header-icon-btn"><exclamation-circle-outlined /></span>
				<span class="header-icon-btn"><mobile-outlined /></span>
				<span class="header-icon-btn"><bell-outlined /></span>
			</div>
			<div class="header-avatar">
				<span class="avatar-circle">🐻</span>
				WAN YI LIN
			</div>
		</div>

		<div class="app-shell">
			<div class="global-rail">
				<div
					v-for="item in globalNavItems"
					:key="item.key"
					class="global-rail-icon"
					:class="{ active: item.active }">
					<component :is="item.icon" />
				</div>
			</div>

			<div class="app-main">
				<div class="app-breadcrumb">
					<home-outlined class="crumb-icon" />
					<span class="crumb-path">商品管理</span>
					<right-outlined class="crumb-sep" />
					<span class="crumb-path crumb-current">建立新商品</span>
				</div>

				<div class="product-content">
					<div class="product-nav-container">
						<div class="product-sidemenu">
							<a-steps
								direction="vertical"
								size="small"
								class="first-steps"
								:current="groupCurrentIndex">
								<a-step
									v-for="(menu, i) in sidemenu"
									:key="`menu_${i}`"
									:title="previewTransl(menu.title)"
									:status="groupStatus(menu, i)"
									:data-active="menu.id === activeNodeId ? 'true' : null"
									@click="menu.id ? $emit('navigate', menu.id) : null">
									<template
										v-if="menu.children"
										v-slot:description>
										<a-steps
											direction="vertical"
											progress-dot
											class="nested-steps"
											:current="subCurrentIndex(menu)">
											<a-step
												v-for="(submenu, i2) of menu.children"
												:key="`submenu_${i2}`"
												:status="submenu.id === activeNodeId ? 'process' : 'finish'"
												:data-active="submenu.id === activeNodeId ? 'true' : null"
												@click="$emit('navigate', submenu.id)">
												<template #title>
													{{ previewTransl(submenu.title) }}
													<span
														v-if="dotState(submenu.id)"
														class="ai-status-dot"
														:class="dotState(submenu.id)" />
												</template>
											</a-step>
										</a-steps>
									</template>
								</a-step>
							</a-steps>
						</div>
					</div>

					<div class="product-main-container">
						<slot />
					</div>

					<div class="product-bubblehint-container">
						<div class="bubble-hint-card">
							<div class="bubble-hint-title">
								<bulb-outlined />
								{{ hintTitle }}
							</div>
							<div class="bubble-hint-content">
								{{ hintContent }}
							</div>
							<div class="bubble-hint-close">
								關閉
							</div>
						</div>
					</div>
				</div>

				<div class="page-footer-actions">
					<a-button>
						預覽
					</a-button>
					<a-button type="primary">
						儲存並下一步
					</a-button>
				</div>

				<div class="app-site-footer">
					Copyright © KKday 2021 All rights reserved.
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import {
	GlobalOutlined, BookOutlined, ExclamationCircleOutlined, MobileOutlined, BellOutlined,
	HomeOutlined, RightOutlined, DownOutlined, BulbOutlined,
	MailOutlined, FileTextOutlined, BarcodeOutlined, CommentOutlined, ShoppingOutlined,
	MessageOutlined, LineChartOutlined, BarChartOutlined, IdcardOutlined, LockOutlined, SafetyOutlined,
} from '@ant-design/icons-vue';
import {getSidemenu, getSteps} from 'libs/prodSidemenu';
import {previewTransl} from 'libs/previewLabels';

const HINTS = {
	productBasicInfo: ['填寫商品基本資訊需注意什麼', '這些資訊將直接影響商品的展示與搜索結果，請確保內容清晰、完整，有助於提升商品的曝光率與銷售效果。'],
	productHighlight: ['完善特點讓商品更加突出', '根據 KKday 數據研究，設定 5 張以上的商品圖普遍有更高的下單率！並填寫詳盡的特色描述，更加突顯商品亮點。'],
	productPkgSchedule: ['關於行程管理', '標示出不同方案所包含的不同服務特色，讓旅客能更容易比較差異！'],
	productDescription: ['關於商品描述', '清楚詳細的商品描述可幫助更多您的服務，提升下單意願。'],
};

export default {
	name: 'PreviewChrome',
	components: {
		GlobalOutlined,
		BookOutlined,
		ExclamationCircleOutlined,
		MobileOutlined,
		BellOutlined,
		HomeOutlined,
		RightOutlined,
		DownOutlined,
		BulbOutlined,
	},
	props: {
		activeNodeId: {
			type: String,
			required: true,
		},
	},
	emits: ['navigate'],
	inject: {
		sharedAiStatus: {default: null},
	},
	data() {
		const sidemenu = getSidemenu(true);
		return {
			sidemenu,
			steps: getSteps(sidemenu),
			globalNavItems: [
				{key: 'home', icon: HomeOutlined},
				{key: 'message', icon: MailOutlined},
				{key: 'order', icon: FileTextOutlined},
				{key: 'writeoff', icon: BarcodeOutlined},
				{key: 'comment', icon: CommentOutlined},
				{key: 'product', icon: ShoppingOutlined, active: true},
				{key: 'frequent', icon: MessageOutlined},
				{key: 'datacenter', icon: LineChartOutlined},
				{key: 'report', icon: BarChartOutlined},
				{key: 'supplier', icon: IdcardOutlined},
				{key: 'auth', icon: LockOutlined},
				{key: 'otp', icon: SafetyOutlined},
			],
		};
	},
	computed: {
		// 用 BASE_URL 而不是寫死絕對路徑，這樣不管部署在網域根目錄還是 GitHub Pages
		// 的子路徑（例如 /repo-name/）底下，logo 都能正確載入
		logoBaseUrl() {
			return import.meta.env.BASE_URL;
		},
		activeStepIndex() {
			return this.steps[this.activeNodeId]?.step ?? 0;
		},
		groupCurrentIndex() {
			return this.activeStepIndex;
		},
		hintTitle() {
			return (HINTS[this.activeNodeId] || HINTS.productBasicInfo)[0];
		},
		hintContent() {
			return (HINTS[this.activeNodeId] || HINTS.productBasicInfo)[1];
		},
	},
	methods: {
		previewTransl,
		groupStatus(menu, groupIndex) {
			if (groupIndex > this.activeStepIndex) {
				return 'wait';
			}
			const containsActive = menu.id === this.activeNodeId ||
				menu.children?.some(child => child.id === this.activeNodeId);
			return containsActive ? 'process' : 'finish';
		},
		subCurrentIndex(menu) {
			const activeIdx = menu.children?.findIndex(child => child.id === this.activeNodeId);
			return activeIdx >= 0 ? activeIdx : menu.children?.length || 0;
		},
		dotState(nodeId) {
			const status = this.sharedAiStatus ? this.sharedAiStatus[nodeId] : null;
			return status === 'generating' || status === 'ready' ? status : null;
		},
	},
};
</script>

<style lang="scss" scoped>
.preview-chrome {
	background: #ecf0f6;
}

.app-header {
	height: 48px;
	display: flex;
	align-items: center;
	background: var(--colors-base-blue-5);
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 10;
}

.header-logo {
	padding: 0 var(--space-margin-xxl);
	display: flex;
	align-items: center;
	height: 100%;

	img {
		height: 20px;
	}
}

.header-city-select {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--space-margin-xxs);
	width: 220px;
	background: #fff;
	border: 1px solid var(--colors-neutral-border-color-border);
	border-radius: var(--border-radius);
	padding: 6px 12px;
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
}

.header-spacer {
	flex: 1;
}

.header-icons {
	display: flex;
	align-items: center;
	height: 100%;
}

.header-icon-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 48px;
	height: 100%;
	color: #fff;
	font-size: 16px;
	cursor: pointer;
}

.header-avatar {
	display: flex;
	align-items: center;
	gap: var(--space-margin-xs);
	height: 100%;
	padding: 0 var(--space-margin);
	background: var(--colors-brand-primary-color-primary);
	color: #fff;
	font-size: 14px;
	font-weight: 600;
	white-space: nowrap;
}

.avatar-circle {
	width: 32px;
	height: 32px;
	border-radius: 50%;
	background: rgba(255, 255, 255, .25);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
}

.app-shell {
	display: block;
}

.global-rail {
	width: 50px;
	position: fixed;
	top: 48px;
	left: 0;
	bottom: 0;
	background: #f9fafc;
	border-right: 1px solid #d2d6de;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: var(--space-margin-sm);
	overflow-y: auto;
	z-index: 9;
}

.global-rail-icon {
	width: 100%;
	padding: 12px 0;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #444;
	font-size: 16px;

	&.active {
		color: #1672bd;
	}
}

.app-main {
	min-width: 0;
	margin-left: 50px;
	padding-top: 105px;
	display: flex;
	flex-direction: column;
}

.app-breadcrumb {
	height: 57px;
	flex-shrink: 0;
	position: fixed;
	top: 48px;
	left: 50px;
	right: 0;
	display: flex;
	align-items: center;
	gap: var(--space-margin-xxs);
	padding: 0 var(--space-margin);
	background: var(--colors-neutral-color-bg-base);
	box-shadow: 0 1px 1px rgba(0, 0, 0, .03), 0 1px 3px rgba(0, 0, 0, .02), 0 2px 2px rgba(0, 0, 0, .02);
	font-size: 14px;
	color: var(--colors-neutral-text-color-text);
	z-index: 9;

	.crumb-icon {
		font-size: 14px;
		color: var(--colors-neutral-text-color-text-tertiary);
	}

	.crumb-sep {
		font-size: 12px;
		color: var(--colors-neutral-text-color-text-quaternary);
	}

	.crumb-current {
		font-weight: 600;
	}
}

.product-content {
	flex: 1;
	display: grid;
	grid-template-columns: 210px 1fr auto;
	grid-gap: var(--space-margin-xs);
	padding: var(--space-margin);
	align-items: stretch;
}

.product-nav-container {
	position: sticky;
	top: calc(105px + var(--space-margin));
	max-height: calc(100vh - 105px - var(--space-margin));
	overflow-y: auto;
	background: var(--colors-neutral-color-bg-base);
	border-radius: var(--border-radius-lg);
	padding: var(--space-margin-md);

	:deep(.ant-steps-item-title) {
		font-size: 14px;
		line-height: 1.5;
		margin-bottom: var(--space-margin);
		padding-right: 0;
		word-break: break-word;
	}

	:deep(.ant-steps-item) {
		padding-inline-start: 0 !important;
	}

	:deep(.ant-steps-item-container[role='button']) {
		cursor: pointer;

		&:hover .ant-steps-item-title,
		&:hover .ant-steps-item-description {
			color: var(--colors-brand-primary-color-primary-text-active) !important;
		}
	}

	:deep(.ant-steps-item[data-active='true'] .ant-steps-item-title) {
		color: var(--colors-brand-primary-color-primary-text-active) !important;
		font-weight: bold;
	}

	:deep(.ant-steps-item-wait .ant-steps-item-title) {
		color: var(--colors-neutral-opacity-6) !important;
	}

	:deep(.ant-steps-item-finish .ant-steps-item-tail::after) {
		background-color: var(--colors-brand-primary-color-primary-border) !important;
	}

	.ai-status-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		margin-left: var(--space-margin-xxs);
		border-radius: 50%;
		vertical-align: middle;

		&.generating {
			background: var(--colors-neutral-text-color-text-quaternary);
			animation: ai-dot-blink 1s ease-in-out infinite;
		}

		&.ready {
			background: var(--colors-base-purple-6);
		}
	}

	@keyframes ai-dot-blink {
		0%,
		100% {
			opacity: 1;
		}

		50% {
			opacity: .25;
		}
	}

	.nested-steps {
		:deep(.ant-steps-item-title) {
			padding-top: var(--space-margin-xxs);
			margin-bottom: var(--space-margin-sm) !important;
		}

		:deep(.ant-steps-item-tail) {
			inset-inline-start: 1px !important;
		}

		:deep(.ant-steps-item-wait .ant-steps-icon-dot) {
			background: rgba(0, 0, 0, .25);
		}

		:deep(.ant-steps-item[data-active='true'] .ant-steps-item-icon) {
			width: 10px;
			height: 10px;
		}

		:deep(.ant-steps-item .ant-steps-item-icon) {
			margin-top: 9px;
			margin-inline-start: 1px;
		}

		:deep(.ant-steps-item .ant-steps-item-content) {
			min-height: unset;
			margin-bottom: 0;
		}

		:deep(.ant-steps-item .ant-steps-item-description) {
			padding-bottom: var(--space-margin-xs);
		}
	}
}

.product-main-container {
	min-width: 0;
	display: flex;
	flex-direction: column;
	min-height: calc(100vh - 105px - 56px - 48px);

	:deep(.ant-form) {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	:deep(.page-card-content) {
		flex: 1;
	}
}

.page-footer-actions {
	position: sticky;
	bottom: 0;
	margin-left: calc(var(--space-margin) + 210px + var(--space-margin-xs));
	margin-right: calc(var(--space-margin) + var(--space-margin-xs) + 220px);
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px var(--space-margin-lg);
	background: var(--colors-neutral-color-bg-base);
	border-top: 1px solid #f0f0f0;
	box-shadow: 0 -2px 8px rgba(0, 0, 0, .04);
	z-index: 8;
}

.product-bubblehint-container {
	width: 220px;

	.bubble-hint-card {
		position: sticky;
		top: calc(105px + var(--space-margin));
		background: var(--colors-neutral-color-bg-base);
		border-radius: var(--border-radius-lg);
		padding: var(--space-margin-lg) var(--space-margin-lg) var(--space-margin-sm);
		box-shadow: inset 0 3px 0 0 #64b3f4;
	}

	.bubble-hint-title {
		display: flex;
		align-items: center;
		gap: var(--space-margin-xxs);
		font-weight: 600;
		font-size: 16px;
		margin-bottom: var(--space-margin-sm);
		color: var(--colors-neutral-text-color-text-heading);
	}

	.bubble-hint-content {
		font-size: 14px;
		color: var(--colors-neutral-text-color-text-secondary);
		line-height: 1.6;
		margin-bottom: var(--space-margin-sm);
	}

	.bubble-hint-close {
		font-size: 14px;
		color: var(--colors-brand-primary-color-primary);
		cursor: pointer;
		width: fit-content;
	}
}

.app-site-footer {
	flex-shrink: 0;
	background: #fff;
	border-top: 1px solid #f0f0f0;
	padding: 15px;
	text-align: center;
	font-size: 14px;
	color: #444;
}
</style>
