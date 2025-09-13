import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default tseslint.config([globalIgnores(["dist"]), {
	files: ["**/*.{ts,tsx}"],
	extends: [
		tseslint.configs.recommended,
		reactHooks.configs["recommended-latest"],
		reactRefresh.configs.vite,
	],
	languageOptions: { ecmaVersion: 2025 },
}]);
