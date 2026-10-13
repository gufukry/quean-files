export type AnnouncementLocale = 'en-US' | 'zh-CN'

export type AnnouncementChangeType =
    'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security'

export type LocalizedAnnouncementText = Readonly<Record<AnnouncementLocale, string>>

export type AnnouncementChange = LocalizedAnnouncementText

export type LauncherAnnouncement = {
    readonly id: string
    readonly version: string
    readonly publishedAt: string
    readonly title: LocalizedAnnouncementText
    readonly changes: Readonly<
        Partial<Record<AnnouncementChangeType, readonly AnnouncementChange[]>>
    >
    readonly notes?: LocalizedAnnouncementText
    readonly externalUrl?: string
}

export const ANNOUNCEMENT_CHANGE_TYPES: readonly AnnouncementChangeType[] = [
    'added',
    'changed',
    'deprecated',
    'removed',
    'fixed',
    'security',
]

export const launcherAnnouncements: readonly LauncherAnnouncement[] = [
    {
        id: 'launcher-1.0.0',
        version: '1.0.0',
        publishedAt: '2026-10-13',
        title: {
            'en-US': 'QueAN Launcher 1.0.0',
            'zh-CN': 'QueAN Launcher 1.0.0',
        },
        changes: {
            added: [
                {
                    'en-US': 'QueAN Launcher is now available.',
                    'zh-CN': 'QueAN Launcher 正式发布。',
                },
            ],
        },
    },
]

export function getAnnouncementByVersion(version: string | null | undefined) {
    if (!version) return undefined
    return launcherAnnouncements.find((announcement) => announcement.version === version)
}

export function getAnnouncements(): readonly LauncherAnnouncement[] {
    return launcherAnnouncements
}

export function getAnnouncementById(id: string) {
    return launcherAnnouncements.find((announcement) => announcement.id === id)
}

export function getLocalizedAnnouncementText(
    text: LocalizedAnnouncementText,
    locale: string,
): string {
    return locale === 'zh-CN' ? text['zh-CN'] : text['en-US']
}
