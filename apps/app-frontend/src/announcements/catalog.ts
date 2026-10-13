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
        id: 'launcher-1.0.2',
        version: '1.0.2',
        publishedAt: '2026-10-13',
        title: {
            'en-US': 'QueAN Launcher 1.0.2',
            'zh-CN': 'QueAN Launcher 1.0.2',
        },
        changes: {
            added: [
                {
                    'en-US':
                        'Update behavior now includes “restart automatically after updating”.',
                    'zh-CN':
                        '更新行为新增「更新完成后自动重启」：更新下载完成后自动安装并重启启动器。',
                },
            ],
        },
    },
    {
        id: 'launcher-1.0.1',
        version: '1.0.1',
        publishedAt: '2026-10-13',
        title: {
            'en-US': 'QueAN Launcher 1.0.1',
            'zh-CN': 'QueAN Launcher 1.0.1',
        },
        changes: {
            added: [
                {
                    'en-US':
                        'Update behavior now offers automatic update checks, notifying you as soon as a new version is found.',
                    'zh-CN':
                        '更新行为新增「自动检测更新」：启动启动器时自动检测，发现新版本立即弹窗提示。',
                },
            ],
            changed: [
                {
                    'en-US': 'Only release versions are delivered; the beta channel was removed.',
                    'zh-CN': '仅接收正式版本，移除测试版渠道切换。',
                },
                {
                    'en-US': 'Removed the database isolation section from update settings.',
                    'zh-CN': '移除更新设置中的「数据库隔离」。',
                },
            ],
        },
    },
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
