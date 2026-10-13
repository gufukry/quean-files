import teamData from './team.json'

export interface TeamMember {
	name: string
	avatar: string
	avatarRemote?: string
	url?: string
	experience?: string
}

const teamAvatarModules = import.meta.glob('./avatars/*', {
	eager: true,
	import: 'default',
	query: '?url',
}) as Record<string, string>

export const teamMembers: (TeamMember & { avatarUrl: string })[] = teamData.map((member) => ({
	...member,
	avatarUrl: teamAvatarModules[`./avatars/${member.avatar}`],
}))
