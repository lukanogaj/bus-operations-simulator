const API_BASE_URL =
	import.meta.env.VITE_API_URL ??
	(import.meta.env.DEV ? "http://localhost:3000" : "");

export const API_URL = API_BASE_URL;
