import { API_URL } from "./api";

export const apiFetch = (path: string, options?: RequestInit) => {
	return fetch(`${API_URL}${path}`, options);
};
