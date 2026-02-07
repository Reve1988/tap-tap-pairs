import { ref, watch } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'tap-tap-pairs-theme'

function getInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

const currentTheme = ref<Theme>(getInitialTheme())

function applyTheme(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
}

// Apply on init
applyTheme(currentTheme.value)

watch(currentTheme, (theme) => applyTheme(theme))

export function useTheme() {
    function toggleTheme() {
        currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    }

    return {
        currentTheme,
        toggleTheme,
    }
}
