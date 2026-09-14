import {message} from 'ant-design-vue';

export const setGlobalConfig = () => {
	const supplierHeaderHeight = 50;
	const breadcrumbHeight = 58;
	message.config({
		top: `${supplierHeaderHeight + breadcrumbHeight}px`,
	});
};

export const generateToken = () => {
	const tokens = {
		token: {},
		components: {},
	};

	function getRootStyle(name) {
		return getComputedStyle(document.documentElement).getPropertyValue(name);
	}

	function setToken(property, tokenName) {
		tokens.token[property] = getRootStyle(tokenName);
	}

	setToken('colorPrimary', '--colors-base-blue-6');
	setToken('colorSuccess', '--colors-base-green-6');
	setToken('colorWarning', '--colors-base-orange-6');
	setToken('colorWarningBg', '--colors-base-orange-1');
	setToken('colorWarningBgHover', '--colors-base-orange-2');
	setToken('colorWarningBorder', '--colors-base-orange-3');
	setToken('colorWarningBorderHover', '--colors-base-orange-4');
	setToken('colorWarningHover', '--colors-base-orange-4');
	setToken('colorWarningActive', '--colors-base-orange-7');
	setToken('colorWarningTextHover', '--colors-base-orange-8');
	setToken('colorWarningTextActive', '--colors-base-orange-10');
	setToken('colorWarningText', '--colors-base-orange-9');
	setToken('colorError', '--colors-base-red-6');
	setToken('colorInfo', '--colors-base-blue-6');
	setToken('borderRadiusXS', '--border-radius-sm');
	setToken('colorBgSpotlight', '--colors-neutral-opacity-9');
	setToken('colorPrimaryBg', '--colors-base-blue-1');
	setToken('colorInfoBg', '--colors-base-blue-1');

	tokens.components.Calender = {
		controlItemBgActive: getRootStyle('--colors-base-blue-1'),
	};

	return tokens;
};
