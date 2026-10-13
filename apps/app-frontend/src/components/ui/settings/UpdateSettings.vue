<script setup lang="ts">
import { EyeIcon, RefreshCwIcon } from '@modrinth/assets'
import { Button, defineMessages, injectNotificationManager, Toggle, useVIntl } from '@modrinth/ui'
import { getVersion } from '@tauri-apps/api/app'
import { inject, ref } from 'vue'

import UpdateAnnouncementHistory from '@/components/ui/announcement/UpdateAnnouncementHistory.vue'
import {
    getUpdatePreferences,
    setUpdatePreferences,
    type UpdatePreferences,
} from '@/helpers/settings.ts'
import { isDev } from '@/helpers/utils.js'
import { type AppUpdateCheckResult, checkForAppUpdate } from '@/providers/app-update.ts'

import SettingsRow from './SettingsRow.vue'
import SettingsSection from './SettingsSection.vue'

const { formatMessage } = useVIntl()
const { handleError } = injectNotificationManager()
const [initialUpdatePreferences, currentVersion, isDevEnvironment] = await Promise.all([
    getUpdatePreferences(),
    getVersion(),
    isDev(),
])
const updatePreferences = ref<UpdatePreferences>(initialUpdatePreferences)
const checking = ref(false)
const checkResult = ref<AppUpdateCheckResult | 'failed' | null>(null)
const previewUpdateAnnouncement = inject<(version: string) => void>('previewUpdateAnnouncement')

const messages = defineMessages({
    title: {
        id: 'app.settings.updates.channel.title',
        defaultMessage: 'Update channel',
    },
    preferencesTitle: {
        id: 'app.settings.updates.preferences.title',
        defaultMessage: 'Update behavior',
    },
    checkTitle: {
        id: 'app.settings.updates.check.title',
        defaultMessage: 'Check for updates',
    },
    description: {
        id: 'app.settings.updates.channel.description',
        defaultMessage: 'Choose which launcher versions QueAN receives.',
    },
    release: {
        id: 'app.settings.updates.channel.release',
        defaultMessage: 'Release',
    },
    releaseDescription: {
        id: 'app.settings.updates.channel.release-description',
        defaultMessage: 'Stable, tested features and fixes. Updates arrive less often.',
    },
    autoCheck: {
        id: 'app.settings.updates.auto-check',
        defaultMessage: 'Check for updates automatically',
    },
    autoCheckDescription: {
        id: 'app.settings.updates.auto-check-description',
        defaultMessage:
            'Check for updates every time QueAN starts, and show a notification as soon as an update is found.',
    },
    autoRestart: {
        id: 'app.settings.updates.auto-restart',
        defaultMessage: 'Restart automatically after updating',
    },
    autoRestartDescription: {
        id: 'app.settings.updates.auto-restart-description',
        defaultMessage:
            'Once an update has finished downloading, install it and restart QueAN automatically.',
    },
    check: {
        id: 'app.settings.updates.check',
        defaultMessage: 'Check for updates',
    },
    checking: {
        id: 'app.settings.updates.checking',
        defaultMessage: 'Checking for updates…',
    },
    available: {
        id: 'app.settings.updates.available',
        defaultMessage: 'An update is available.',
    },
    upToDate: {
        id: 'app.settings.updates.up-to-date',
        defaultMessage: 'QueAN is up to date.',
    },
    disabled: {
        id: 'app.settings.updates.disabled',
        defaultMessage: 'Updates are disabled in this build.',
    },
    offline: {
        id: 'app.settings.updates.offline',
        defaultMessage: 'Connect to the internet to check for updates.',
    },
    failed: {
        id: 'app.settings.updates.failed',
        defaultMessage: 'Could not check for updates.',
    },
    security: {
        id: 'app.settings.updates.security',
        defaultMessage: 'Updates are installed only when their cryptographic signature is valid.',
    },
    currentVersion: {
        id: 'app.settings.updates.current-version',
        defaultMessage: 'Current version {version}',
    },
    pause: {
        id: 'app.settings.updates.pause',
        defaultMessage: 'Pause updates',
    },
    pauseDescription: {
        id: 'app.settings.updates.pause-description',
        defaultMessage:
            'Stop automatic update checks, downloads, and update notifications until you resume updates.',
    },
    paused: {
        id: 'app.settings.updates.paused',
        defaultMessage: 'Updates are paused.',
    },
    preview: {
        id: 'app.settings.updates.preview-announcement',
        defaultMessage: 'Preview update announcement',
    },
})

const resultMessages: Record<AppUpdateCheckResult | 'failed', keyof typeof messages> = {
    available: 'available',
    'up-to-date': 'upToDate',
    disabled: 'disabled',
    offline: 'offline',
    failed: 'failed',
    paused: 'paused',
}

async function saveUpdatePreferences() {
    try {
        await setUpdatePreferences(updatePreferences.value)
    } catch (error) {
        handleError(error)
    }
}

async function checkForUpdates() {
    checking.value = true
    checkResult.value = null

    try {
        checkResult.value = await checkForAppUpdate()
    } catch (error) {
        checkResult.value = 'failed'
        handleError(error)
    } finally {
        checking.value = false
    }
}
</script>

<template>
    <div class="flex flex-col gap-6">
        <SettingsSection :title="formatMessage(messages.title)">
            <div class="update-channel-panel">
                <p
                    id="settings-target-updates-channel"
                    class="m-0 text-sm leading-[1.45] text-[var(--color-text-tertiary)]"
                >
                    {{ formatMessage(messages.description) }}
                </p>
                <div class="update-channel-static">
                    <span class="update-channel-card-title">{{
                        formatMessage(messages.release)
                    }}</span>
                    <span class="update-channel-card-description">{{
                        formatMessage(messages.releaseDescription)
                    }}</span>
                </div>
            </div>
        </SettingsSection>

        <SettingsSection :title="formatMessage(messages.preferencesTitle)">
            <SettingsRow>
                <template #label>{{ formatMessage(messages.autoCheck) }}</template>
                <template #description>{{ formatMessage(messages.autoCheckDescription) }}</template>
                <template #control>
                    <Toggle
                        id="auto-update-check"
                        v-model="updatePreferences.autoCheckUpdates"
                        @update:model-value="saveUpdatePreferences"
                    />
                </template>
            </SettingsRow>
            <SettingsRow>
                <template #label>{{ formatMessage(messages.autoRestart) }}</template>
                <template #description>{{
                    formatMessage(messages.autoRestartDescription)
                }}</template>
                <template #control>
                    <Toggle
                        id="auto-restart-after-update"
                        v-model="updatePreferences.autoRestartAfterUpdate"
                        @update:model-value="saveUpdatePreferences"
                    />
                </template>
            </SettingsRow>
            <SettingsRow>
                <template #label>{{ formatMessage(messages.pause) }}</template>
                <template #description>{{ formatMessage(messages.pauseDescription) }}</template>
                <template #control>
                    <Toggle
                        id="pause-updates"
                        v-model="updatePreferences.updatesPaused"
                        @update:model-value="saveUpdatePreferences"
                    />
                </template>
            </SettingsRow>
        </SettingsSection>

        <SettingsSection :title="formatMessage(messages.checkTitle)">
            <div class="update-check-panel">
                <div class="update-check-heading">
                    <p class="m-0 text-sm text-[var(--color-text-tertiary)]">
                        {{ formatMessage(messages.currentVersion, { version: currentVersion }) }}
                    </p>
                    <p class="m-0 text-sm text-[var(--color-text-tertiary)]">
                        {{ formatMessage(messages.security) }}
                    </p>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Button
                        type="colored"
                        color="brand"
                        :disabled="checking"
                        @click="checkForUpdates"
                    >
                        <RefreshCwIcon :class="{ 'animate-spin': checking }" />
                        {{ formatMessage(checking ? messages.checking : messages.check) }}
                    </Button>
                    <Button
                        v-if="isDevEnvironment && previewUpdateAnnouncement"
                        type="outlined"
                        native-type="button"
                        @click="previewUpdateAnnouncement(currentVersion)"
                    >
                        <EyeIcon />
                        {{ formatMessage(messages.preview) }}
                    </Button>
                </div>
                <p
                    v-if="checkResult"
                    class="update-check-result"
                    :class="`update-check-result-${checkResult}`"
                    role="status"
                >
                    {{ formatMessage(messages[resultMessages[checkResult]]) }}
                </p>
            </div>
        </SettingsSection>

        <UpdateAnnouncementHistory :current-version="currentVersion" />
    </div>
</template>

<style scoped>
.update-check-panel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--gap-md);
    padding: var(--gap-lg);
}

.update-channel-panel {
    display: flex;
    flex-direction: column;
    gap: var(--gap-md);
    padding: var(--gap-lg);
}

.update-channel-static {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
    padding: var(--gap-md);
    border: 1px solid var(--surface-4);
    border-radius: var(--radius-md);
    background: var(--surface-1);
}

.update-channel-card-title {
    color: var(--color-text-primary);
    font-weight: 600;
}

.update-channel-card-description {
    color: var(--color-text-tertiary);
    font-size: 0.875rem;
    line-height: 1.4;
}

.update-check-heading {
    display: flex;
    flex-direction: column;
    gap: var(--gap-xs);
}

.update-check-result {
    margin: 0;
    padding: var(--gap-sm) var(--gap-md);
    border: 1px solid var(--surface-4);
    border-radius: var(--radius-sm);
    background: var(--surface-1);
    color: var(--color-text-tertiary);
    font-size: 0.875rem;
    line-height: 1.4;
}

.update-check-result-available {
    border-color: color-mix(in srgb, var(--color-brand) 45%, var(--surface-4));
    color: var(--color-brand);
}

.update-check-result-failed,
.update-check-result-offline {
    border-color: color-mix(in srgb, var(--color-red) 45%, var(--surface-4));
    color: var(--color-red);
}

.update-check-result-paused,
.update-check-result-disabled {
    border-color: color-mix(in srgb, var(--color-yellow) 45%, var(--surface-4));
    color: var(--color-yellow);
}
</style>
