import { execFileSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// 本地一键打包：设定版本 -> 构建 Windows 安装包 -> 生成更新清单与校验和。
//
// 用法:
//   pnpm axolotl:local-release v1.0.0 [--notes notes.md] [--skip-build]
//
// 需先准备签名密钥（自动更新包必须签名）:
//   pnpm tauri signer generate -w ~/.tauri/quean.key
//   TAURI_SIGNING_PRIVATE_KEY=$(cat ~/.tauri/quean.key) \
//   TAURI_SIGNING_PRIVATE_KEY_PASSWORD=... pnpm axolotl:local-release v1.0.0
//
// 产物输出到 release/，上传到更新服务器即可。

const UPDATE_BASE_URL = (process.env.QUEAN_UPDATE_BASE_URL ?? 'https://qafaka.cc.cd/quean-update').replace(/\/$/, '')

const args = process.argv.slice(2)
const tag = args[0]
const version = tag?.replace(/^v/, '')

if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
	throw new Error(`Expected a semantic version tag such as v1.2.3, received: ${tag ?? '<none>'}`)
}

const skipBuild = args.includes('--skip-build')
const notesIndex = args.indexOf('--notes')
const notesPath = notesIndex === -1 ? null : args[notesIndex + 1]
const notes = notesPath ? fs.readFileSync(notesPath, 'utf8').trim() : `QueAN Launcher ${version}`

const root = process.cwd()
const outputDir = path.join(root, 'release')

function run(command, commandArgs) {
	console.log(`\n$ ${command} ${commandArgs.join(' ')}`)
	execFileSync(command, commandArgs, {
		stdio: 'inherit',
		// Windows 上 pnpm/node 是 .cmd 垫片，必须经 shell 才能解析
		shell: process.platform === 'win32',
	})
}

function collectFiles(dir) {
	const found = []
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const full = path.join(dir, entry.name)
		if (entry.isDirectory()) found.push(...collectFiles(full))
		else found.push(full)
	}
	return found
}

// 1. 版本号写入 apps/app-frontend/package.json 与两个 Cargo.toml
run('node', ['scripts/axolotl/set-version.mjs', `v${version}`])

// 2. 构建（createUpdaterArtifacts 已在 tauri-release.conf.json 开启）
if (!skipBuild) {
	if (
		!process.env.TAURI_SIGNING_PRIVATE_KEY &&
		!process.env.TAURI_SIGNING_PRIVATE_KEY_PATH
	) {
		console.warn(
			'\n[警告] 未设置 TAURI_SIGNING_PRIVATE_KEY 或 TAURI_SIGNING_PRIVATE_KEY_PATH，'
				+ '无法生成更新包签名，自动更新会失败。\n'
				+ '        先运行: pnpm --filter @modrinth/app tauri signer generate -w C:/Users/<你>/.tauri/quean.key',
		)
	}
	// 使用自定义安装器（tauri-modern.conf.json）：NSIS 模板 + QueAN 侧栏/顶部图 + 安装界面
	run('pnpm', ['--filter', '@modrinth/app', 'tauri', 'build', '--config', 'tauri-release.conf.json', '--config', 'tauri-modern.conf.json'])
}

// 3. 定位构建产物（Cargo workspace 的 target 可能在根目录或 apps/app 下）
const bundleCandidates = [
	path.join(root, 'target', 'release', 'bundle'),
	path.join(root, 'apps', 'app', 'target', 'release', 'bundle'),
]
const bundleDir = bundleCandidates.find((candidate) => fs.existsSync(candidate))
if (!bundleDir) {
	throw new Error(`找不到构建产物目录，已尝试: ${bundleCandidates.join(', ')}`)
}

const files = collectFiles(bundleDir)
const installer = files.find((file) => /_x64-setup\.exe$/.test(file))
const portable = files.find((file) => /_x64_portable\.zip$/.test(file))
const updaterArchive = files.find((file) => /_x64-setup\.nsis\.zip$/.test(file))
const updaterSignature = files.find((file) => /\.nsis\.zip\.sig$/.test(file))

if (!installer) {
	throw new Error(`未找到 Windows 安装包（*_x64-setup.exe），产物目录: ${bundleDir}`)
}

fs.mkdirSync(outputDir, { recursive: true })

const stripExt = (name) => name.replace(/\.[^.]+$/, '')
const toOutput = (file) => path.join(outputDir, path.basename(file))
const copyOut = (file) => {
	const target = toOutput(file)
	fs.copyFileSync(file, target)
	return target
}
const sha256Of = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')

// 4. 安装包 + 便携包
const published = []
const installerTarget = copyOut(installer)
published.push(installerTarget)
if (portable) published.push(copyOut(portable))

// 5. 更新清单（Tauri updater 的 /latest）
let artifacts = []
if (updaterArchive && updaterSignature) {
	const archive = copyOut(updaterArchive)
	const signature = fs.readFileSync(updaterSignature, 'utf8').trim()
	const updaterTarget = stripExt(path.basename(installer))
	const archiveName = path.basename(archive)
	published.push(archive)

	const latest = {
		version,
		notes,
		pub_date: new Date().toISOString(),
		platforms: {
			'windows-x86_64': {
				signature,
				url: `${UPDATE_BASE_URL}/${archiveName}`,
			},
		},
	}
	fs.writeFileSync(path.join(outputDir, 'latest'), `${JSON.stringify(latest, null, 2)}\n`)

	artifacts = [
		{ kind: 'updater', variant: 'tauri', platform: updaterTarget, architecture: 'x86_64', relative_path: archiveName, sha256: sha256Of(archive), size: fs.statSync(archive).size },
	]
	console.log(`\n已生成更新清单 release/latest -> ${UPDATE_BASE_URL}/${archiveName}`)
} else {
	console.warn(
		'\n[警告] 未找到更新包或其签名（*_x64-setup.nsis.zip / .sig），已跳过 latest 与 api/versions。\n' +
			'        请确认设置了签名密钥后重新运行。',
	)
}

// 6. 版本目录（更新服务器的 /api/versions）
const catalogArtifacts = [
	{ kind: 'installer', variant: 'legacy', platform: 'windows', architecture: 'x86_64', relative_path: path.basename(installerTarget), sha256: sha256Of(installerTarget), size: fs.statSync(installerTarget).size },
	...artifacts,
]
if (portable) {
	const portableTarget = toOutput(portable)
	catalogArtifacts.push({ kind: 'portable', variant: 'portable', platform: 'windows', architecture: 'x86_64', relative_path: path.basename(portableTarget), sha256: sha256Of(portableTarget), size: fs.statSync(portableTarget).size })
}

const catalog = { versions: [{ version, artifacts: catalogArtifacts }] }
const catalogDir = path.join(outputDir, 'api')
fs.mkdirSync(catalogDir, { recursive: true })
fs.writeFileSync(path.join(catalogDir, 'versions'), `${JSON.stringify(catalog, null, 2)}\n`)

// 7. 校验和
const sums = published
	.map((file) => `${sha256Of(file)}  ${path.basename(file)}`)
	.join('\n')
fs.writeFileSync(path.join(outputDir, 'SHA256SUMS.txt'), `${sums}\n`)

console.log('\n完成。release/ 内容:')
for (const entry of fs.readdirSync(outputDir, { recursive: true })) {
	const full = path.join(outputDir, entry)
	if (fs.statSync(full).isFile()) console.log(`  ${entry}`)
}
console.log(`\n上传到更新服务器后即可生效:\n  release/latest         -> ${UPDATE_BASE_URL}/latest\n  release/api/versions   -> ${UPDATE_BASE_URL}/api/versions\n  release/*.exe|zip|nsis.zip -> ${UPDATE_BASE_URL}/`)
