<template>
	<div
		class="pkg-sub-card"
		:class="{
			minimize: showExpandBtn && !isPkgSubCardOpen,
			'is-expandable': showExpandBtn,
		}">
		<div
			class="pkg-sub-card-header h-100 d-flex align-items-center"
			:class="{
				disabled: isDisabled,
				'header-bottom-line': hasHeaderBottomLine,
				'is-light': isLightHeader
			}"
			@click="toggleExpand">
			<div
				v-if="showExpandBtn"
				class="toggle-btn h-100 d-flex justify-content-center align-items-center">
				<down-outlined />
			</div>
			<div
				class="title w-100"
				:class="{[size]: true, 'has-action-icons': showDeleteBtn || showSortBtn, 'has-expand-icon': showExpandBtn}">
				<span
					v-if="isRequired"
					class="required">*</span>
				<span>{{ title }}</span>
			</div>
			<div
				v-if="showDeleteBtn || showSortBtn"
				class="actions"
				:class="{[size]: true}"
				@click.stop>
				<div
					v-if="showDeleteBtn"
					class="delete-btn"
					:class="{disabled: !canDelete || isDisabled}">
					<delete-outlined @click="$emit('delete')" />
				</div>
				<div
					v-if="showSortBtn"
					class="sort-btn"
					:class="{disabled: !canSort || isDisabled}">
					<menu-outlined
						@mouseover="!canSort || isDisabled ? null : $emit('mouseoverdrag')"
						@mouseleave="!canSort || isDisabled ? null : $emit('mouseleavedrag')" />
				</div>
			</div>
		</div>
		<div
			v-show="isPkgSubCardOpen"
			class="pkg-sub-card-body"
			:is-dragging-collapsed="isDragging"
			:style="{'background-color': bgColor}">
			<slot />
		</div>
	</div>
</template>

<script>
import {DownOutlined, DeleteOutlined, MenuOutlined} from '@ant-design/icons-vue';

export default {
	name: 'PkgSubCard',
	components: {
		DownOutlined,
		DeleteOutlined,
		MenuOutlined,
	},
	props: {
		title: {
			type: String,
			default: '',
		},
		/**
		 * @prop {String} size
		 * @values ['small', 'medium']
		 */
		size: {
			type: String,
			default: 'medium',
		},
		bgColor: {
			type: String,
			default: '#fff',
		},
		hasHeaderBottomLine: {
			type: Boolean,
			default: false,
		},
		isDisabled: {
			type: Boolean,
			default: false,
		},
		showExpandBtn: {
			type: Boolean,
			default: true,
		},
		isExpanded: {
			type: Boolean,
			default: true,
		},
		showDeleteBtn: {
			type: Boolean,
			default: false,
		},
		showSortBtn: {
			type: Boolean,
			default: false,
		},
		canDelete: {
			type: Boolean,
			default: false,
		},
		canSort: {
			type: Boolean,
			default: false,
		},
		isDragging: {
			type: Boolean,
			default: false,
		},
		isLightHeader: {
			type: Boolean,
			default: false,
		},
		isRequired: {
			type: Boolean,
			default: false,
		},
	},
	computed: {
		isPkgSubCardOpen() {
			return this.isDragging ? false : this.isExpanded;
		},
	},
	methods: {
		toggleExpand() {
			if (this.showExpandBtn) {
				this.$emit('toggle', !this.isExpanded);
			}
		},
	},
};
</script>

<style lang="scss" scoped>
$toggle-btn-size: 14px;
$toggle-btn-padding-x: var(--base-size-lg);
$toggle-btn-width: calc(#{$toggle-btn-size} + #{$toggle-btn-padding-x});

.pkg-sub-card {
	background: var(--colors-neutral-color-bg-base);
	border: 1px solid var(--colors-neutral-border-color-border);
	border-radius: var(--border-radius-lg);
	&.minimize {
		.toggle-btn .anticon-down {
			transform: rotate(-90deg);
		}
	}
	&.is-expandable {
		.title {
			cursor: pointer;
		}
	}

	.pkg-sub-card-header {
		background: var(--colors-neutral-fill-color-fill-tertiary);
		border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
		&.is-light {
			background: var(--colors-neutral-fill-color-fill-alter);
		}
		&.header-bottom-line {
			border-bottom: var(--line-width) solid
				var(--colors-neutral-border-color-border);
		}

		.toggle-btn {
			width: $toggle-btn-width;
			padding: 0 var(--base-size-sm);
			cursor: pointer;

			.anticon-down {
				transition: transform 0.3s;
			}
		}

		.title {
			padding: var(--base-size-sm) 0;
			overflow: hidden;
			white-space: nowrap;
			text-overflow: ellipsis;
			padding-right: var(--base-size-ms);
			padding-left: var(--base-size-ms);
			&.small {
				font-weight: var(--typography-font-weight-strong);
				font-size: var(--typography-font-size);
				line-height: var(--typography-line-height);
			}
			&.medium {
				font-weight: var(--typography-font-weight-strong);
				font-size: var(--typography-font-size-heading5);
				line-height: var(--typography-line-height-lg);
			}
			&.has-action-icons {
				padding-right: 0px;
			}
			&.has-expand-icon {
				padding-left: 0px;
			}

			.required {
				margin-right: var(--base-size-xxs);
				font-weight: var(--typography-font-weight-normal);
				font-size: var(--typography-font-size);
			}
		}

		.actions {
			padding: 0 var(--base-size-ms);
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: auto auto auto;
			&.small {
				grid-gap: 10px;
			}
			&.medium {
				grid-gap: var(--base-size-sm);
			}
		}

		.delete-btn,
		.sort-btn {
			opacity: 0.45;

			&.disabled {
				opacity: 0.15;
				pointer-events: none;
			}
		}

		.sort-btn {
			cursor: grab;
			transition: all 0.15s ease;
			&:active {
				//cursor: grabbing;
				opacity: 1;
				transform: scale(1.05);
			}
			&:not(.disabled):hover {
				opacity: 0.75;
			}
		}

		&.disabled {
			pointer-events: none;
			color: var(--colors-neutral-text-color-text-disabled);
		}
	}

	.pkg-sub-card-body {
		padding: var(--base-size);
		background: var(--colors-neutral-color-bg-base);
		border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
	}

	&:-webkit-drag .pkg-sub-card-body {
		display: none;
	}
}
</style>
