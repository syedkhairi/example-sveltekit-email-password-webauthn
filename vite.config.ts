import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { telefunc } from 'telefunc/vite'

export default defineConfig({
	plugins: [sveltekit(), telefunc()]
});
