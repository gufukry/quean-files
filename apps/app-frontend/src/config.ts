const trimTrailingSlash = (url: string) => url.replace(/\/$/, '')

export const QueANBrandConfig = Object.freeze({
    productName: 'QueAN Launcher',
    shortProductName: 'QueAN',
    website: 'https://qafaka.cc.cd/',
    repositoryUrl: 'https://github.com/gufukry/quean-files',
    supportUrl: 'https://github.com/gufukry/quean-files/issues',
    qqGroupNumber: '',
    qqChannelUrl: '',
    sponsorUrl: 'https://afdian.com/a/QueAN',
    bundleIdentifier: 'com.quean.launcher',
    deepLinkScheme: 'quean',
    userAgent: (version: string, os: string) => `QueAN/${version} (${os})`,
    capabilities: Object.freeze({
        publicModrinthApi: true,
        privateModrinthServices: false,
        ghsTelemetry: false,
    }),
})

const siteUrl = trimTrailingSlash(import.meta.env.MODRINTH_URL || 'https://modrinth.com')
const officialLabrinthBaseUrl = trimTrailingSlash(
    import.meta.env.MODRINTH_API_BASE_URL || 'https://api.modrinth.com',
)
type DownloadSourceMode = 'auto' | 'official_only' | 'mirror_preferred' | 'official_preferred'

// The Modrinth API always uses the official source; Modrinth download mirror
// routing is handled by the Rust download layer.
export function setModrinthSourceMode(_sourceMode: DownloadSourceMode) {}

export function setModrinthMirrorEnabled(_enabled: boolean) {}

export function getOfficialLabrinthBaseUrl() {
    return officialLabrinthBaseUrl
}

export function getLabrinthBaseUrl() {
    return officialLabrinthBaseUrl
}

export const config = {
    siteUrl,
    labrinthBaseUrl: getLabrinthBaseUrl,
}
