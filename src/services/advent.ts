import { AdventDay, AdventDayCreate } from "@/types/advent";
import { API_BASE_URL, ApiError } from "./api";
import { getSessionId } from "@/utils/cookies";


export const adventApi = {
    _appendSessionHeader: (headers: HeadersInit = {}): HeadersInit => {
        const sessionId = getSessionId();
        if (!sessionId) {
            throw new Error("No active session");
        }
        return {
            ...headers,
            "X-Session-Id": sessionId,
        };
    },

    getAdventsByMe: async (): Promise<AdventDay[]> => {
        const response = await fetch(`${API_BASE_URL}/advent/by_me`, {
            headers: adventApi._appendSessionHeader(),
        });
        if (!response.ok) {
            throw new Error("Failed to fetch advents for me");
        }
        return await response.json();
    },

    getAdventsForMe: async (): Promise<AdventDay[]> => {
        const response = await fetch(`${API_BASE_URL}/advent/for_me`, {
            headers: adventApi._appendSessionHeader(),
        });
        if (!response.ok) {
            throw new Error("Failed to fetch advents for me");
        }
        return await response.json();
    },

    getAdventsForToday: async (): Promise<AdventDay[]> => {
        const response = await fetch(`${API_BASE_URL}/advent/today`);
        if (!response.ok) {
            throw new Error("Failed to fetch today's advents");
        }
        return await response.json();
    },

    getAdventsByDay: async (day: number): Promise<AdventDay[]> => {
        const response = await fetch(`${API_BASE_URL}/advent/day/${day}`, {
            headers: adventApi._appendSessionHeader(),
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch advents for day ${day}`);
        }
        return await response.json();
    },

    getAdventById: async (id: string): Promise<AdventDay> => {
        const response = await fetch(`${API_BASE_URL}/advent/${id}`, {
            headers: adventApi._appendSessionHeader(),
        });
        if (!response.ok) {
            throw new Error("Advent not found");
        }
        return await response.json();
    },

    deleteAdventById: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/advent/${id}`, {
            method: "DELETE",
            headers: adventApi._appendSessionHeader(),
        });
        if (!response.ok) {
            throw new Error("Failed to delete advent");
        }
    },

    createAdvent: async (adventData: AdventDayCreate): Promise<AdventDay> => {
        const formData = new FormData();
        formData.append("day", adventData.day.toString());
        formData.append("title", adventData.title);
        formData.append("description", adventData.description);
        formData.append("type", adventData.type);
        if (adventData.actor) {
            formData.append("actor", adventData.actor);
        }
        formData.append("image", adventData.image);

        const response = await fetch(`${API_BASE_URL}/advent`, {
            method: "POST",
            headers: adventApi._appendSessionHeader(),
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.detail || "Failed to create advent",
            );
        }

        return await response.json();
    },
}