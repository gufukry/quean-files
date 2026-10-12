<template>
    <section
        v-if="showControls"
        class="flex items-center gap-2 mr-1.5"
        data-tauri-drag-region-exclude
    >
        <!-- 纯装饰：macOS 风格三色点（无功能，不拦截点击） -->
        <span class="traffic-lights" aria-hidden="true"><i></i><i></i><i></i></span>
        <Button
            type="quiet"
            circular
            icon-only
            :label="formatMessage(messages.minimize)"
            class="relative expanded-button"
            @click="() => getCurrentWindow().minimize()"
            ><MinimizeIcon />
        </Button>
        <Button
            type="quiet"
            circular
            icon-only
            :label="
                isMaximized ? formatMessage(messages.restore) : formatMessage(messages.maximize)
            "
            class="relative expanded-button"
            @click="() => getCurrentWindow().toggleMaximize()"
            ><RestoreIcon v-if="isMaximized" />
            <MaximizeIcon v-else />
        </Button>
        <Button
            type="quiet"
            color="red"
            interaction="filled"
            circular
            icon-only
            :label="formatMessage(messages.close)"
            class="relative expanded-button close-button"
            @click="handleClose"
        >
            <XIcon />
        </Button>
    </section>
</template>

<script setup>
import { MaximizeIcon, MinimizeIcon, RestoreIcon, XIcon } from '@modrinth/assets'
import { Button, defineMessages, useVIntl } from '@modrinth/ui'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { saveWindowState, StateFlags } from '@tauri-apps/plugin-window-state'
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { get as getSettings } from '@/helpers/settings.ts'
import { getOS } from '@/helpers/utils.js'
import { useTheming } from '@/store/state'

const themeStore = useTheming()
const { formatMessage } = useVIntl()

const messages = defineMessages({
    minimize: {
        id: 'app.window-controls.minimize',
        defaultMessage: 'Minimize',
    },
    maximize: {
        id: 'app.window-controls.maximize',
        defaultMessage: 'Maximize',
    },
    restore: {
        id: 'app.window-controls.restore',
        defaultMessage: 'Restore',
    },
    close: {
        id: 'app.window-controls.close',
        defaultMessage: 'Close',
    },
})

const nativeDecorations = ref(true)
const isMaximized = ref(false)
const os = ref('')
const unlistenResize = ref(null)
let resizeTimer

const alwaysShowAppControls = computed(() => themeStore.getFeatureFlag('always_show_app_controls'))

const showControls = computed(
    () =>
        alwaysShowAppControls.value ||
        (!nativeDecorations.value && (os.value === 'Windows' || os.value === 'Linux')),
)

onMounted(async () => {
    os.value = await getOS()

    const settings = await getSettings()
    nativeDecorations.value = settings.native_decorations

    if (os.value !== 'MacOS') {
        await getCurrentWindow().setDecorations(nativeDecorations.value)
    }

    isMaximized.value = await getCurrentWindow().isMaximized()

    unlistenResize.value = await getCurrentWindow().onResized(() => {
        // Windows emits a burst of resize events while a game changes display mode.
        if (resizeTimer) clearTimeout(resizeTimer)
        resizeTimer = setTimeout(async () => {
            resizeTimer = undefined
            try {
                isMaximized.value = await getCurrentWindow().isMaximized()
            } catch (error) {
                console.warn('Failed to refresh maximized state after resize', error)
            }
        }, 100)
    })
})

onUnmounted(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    if (unlistenResize.value) {
        unlistenResize.value()
    }
})

const handleClose = async () => {
    await saveWindowState(StateFlags.ALL)
    await getCurrentWindow().close()
}
</script>
<style scoped>
/* 纯装饰三色点：仅展示，不参与交互 */
.traffic-lights {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-right: 10px;
    pointer-events: none;
    user-select: none;
}
.traffic-lights i {
    display: block;
    width: 11px;
    height: 11px;
    border-radius: 50%;
}
.traffic-lights i:nth-child(1) { background: #ff5f57; }
.traffic-lights i:nth-child(2) { background: #febc2e; }
.traffic-lights i:nth-child(3) { background: #28c840; }
.expanded-button::before {
    inset: -9px -6px;
    content: '';
    position: absolute;
}

.expanded-button.close-button::before {
    inset: -9px -9px -9px -6px;
}
</style>
