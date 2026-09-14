import {fileURLToPath} from 'node:url';
import * as path from 'path';

import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => ({
	// 相對路徑，這樣不管部署在 GitHub Pages 的哪個子路徑下都能正常運作
	base: './',
	plugins: [
		vue(),
	],
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: '@use "@/assets/scss/_variables.scss" as *;',
			},
		},
	},
	build: {
		target: 'esnext',
		outDir: 'dist',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			components: path.resolve(__dirname, 'src/components'),
			pages: path.resolve(__dirname, 'src/pages'),
			configs: path.resolve(__dirname, 'src/configs'),
			libs: path.resolve(__dirname, 'src/libs'),
			constants: path.resolve(__dirname, 'src/constants'),
		},
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
	},
}));
