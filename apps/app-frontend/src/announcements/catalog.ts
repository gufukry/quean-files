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
        id: 'launcher-1.0.7',
        version: '1.0.7',
        publishedAt: '2026-10-14',
        title: {
            'en-US': 'QueAN Launcher 1.0.7',
            'zh-CN': 'QueAN Launcher 1.0.7',
        },
        changes: {
            fixed: [
                {
                    'en-US':
                        'Announcements now load reliably (the request no longer goes through the webview).',
                    'zh-CN': '再次修复公告加载（改用不受 CSP／CORS 限制的请求方式）。',
                },
                {
                    'en-US':
                        'Capes are now shown for third-party (Yggdrasil) accounts.',
                    'zh-CN': '第三方（Yggdrasil）账号现在会显示披风。',
                },
            ],
        },
    },
    {
        id: 'launcher-1.0.6',
        version: '1.0.6',
        publishedAt: '2026-10-14',
        title: {
            'en-US': 'QueAN Launcher 1.0.6',
            'zh-CN': 'QueAN Launcher 1.0.6',
        },
        changes: {
            added: [
                {
                    'en-US': 'Download progress is now shown on the Windows taskbar.',
                    'zh-CN': 'Windows 任务栏显示下载进度。',
                },
            ],
            changed: [
                {
                    'en-US':
                        'For third-party (Yggdrasil) accounts, the “Add skin” button now opens the provider website.',
                    'zh-CN':
                        '第三方（Yggdrasil）账号的「添加皮肤」按钮改为打开服务商网站更换皮肤。',
                },
            ],
            fixed: [
                {
                    'en-US': 'Announcements now load correctly from the update server.',
                    'zh-CN': '修复公告无法从更新服务器加载（公告功能可用）。',
                },
            ],
        },
    },
    {
        id: 'launcher-1.0.5',
        version: '1.0.5',
        publishedAt: '2026-10-14',
        title: {
            'en-US': 'QueAN Launcher 1.0.5',
            'zh-CN': 'QueAN Launcher 1.0.5',
        },
        changes: {
            fixed: [
                {
                    'en-US':
                        'CurseForge modpack resolution now also routes non-GET API calls through the key-free mirror, so CurseForge modpacks import correctly.',
                    'zh-CN':
                        '修复 CurseForge 整合包解析：非 GET 请求也走免 Key 镜像，CurseForge 整合包可正常导入。',
                },
            ],
        },
    },
    {
        id: 'launcher-1.0.4',
        version: '1.0.4',
        publishedAt: '2026-10-14',
        title: {
            'en-US': 'QueAN Launcher 1.0.4',
            'zh-CN': 'QueAN Launcher 1.0.4',
        },
        changes: {
            fixed: [
                {
                    'en-US':
                        'CurseForge modpacks and mods could not be resolved; CurseForge API access now works again.',
                    'zh-CN': '修复 CurseForge 整合包／模组无法解析安装的问题。',
                },
                {
                    'en-US':
                        'The Windows installer no longer misdetects WebView2 as missing and re-downloads it; it now skips when the runtime is already installed.',
                    'zh-CN':
                        '修复 Windows 安装向导误判 WebView2 未安装而重复下载的问题：已安装时会正确跳过。',
                },
            ],
        },
    },
    {
        id: 'launcher-1.0.3',
        version: '1.0.3',
        publishedAt: '2026-10-13',
        title: {
            'en-US': 'QueAN Launcher 1.0.3',
            'zh-CN': 'QueAN Launcher 1.0.3',
        },
        changes: {
            changed: [
                {
                    'en-US':
                        'A notification pops up when a new version is detected instead of updating silently.',
                    'zh-CN': '检测到新版本时弹出通知提示，不再静默更新。',
                },
            ],
        },
    },
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
