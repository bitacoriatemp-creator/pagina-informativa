export type Role = "Owner" | "Editor" | "Viewer";

export interface TeamMember {
    initials: string;
    name?: string;
    role: Role;
    color: string;
    lastActivity?: string;
    avatarUrl?: string;
}

export interface Project {
    id: string;
    title: string;
    subtitle: string;
    role: Role;
    gradient: string;
    ownerInitials: string;
    lastUpdated?: string;
    lastEntry?: string;
    team?: TeamMember[];
    coverImage?: string; // base64 data URL for custom cover photo
}
