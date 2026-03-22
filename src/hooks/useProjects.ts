import { useState, useEffect } from "react";
import { Project, Role } from "@/types/project";
import { APPEARANCES, DEFAULT_PROJECTS } from "@/utils/mockData";

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window !== "undefined") {
            try {
                const saved = localStorage.getItem("bitacoria_projects");
                if (saved) {
                    const parsed = JSON.parse(saved) as Project[];
                    const hasNames = parsed.every(p => (p.team || []).every(m => m.name));
                    const hasAvatars = parsed.some(p => (p.team || []).some(m => m.avatarUrl));
                    
                    // Descartar caché si tiene rutas corruptas o viejas
                    const isCorrupted = saved.includes("\\.webp") || saved.includes(".png");
                    
                    if (!isCorrupted && parsed.length > 0 && hasNames && hasAvatars) return parsed;
                }
            } catch { /* ignore corrupt data */ }
        }
        return DEFAULT_PROJECTS;
    });

    useEffect(() => {
        try {
            localStorage.setItem("bitacoria_projects", JSON.stringify(projects));
        } catch { /* storage full or unavailable */ }
    }, [projects]);

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; projectId: string | null; projectTitle: string }>({
        open: false, projectId: null, projectTitle: ""
    });

    const openCreateModal = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const saveProject = (projectData: {
        title: string;
        subtitle: string;
        gradient: string;
        coverImage?: string | null;
        invitedUsers: { id: string | number; name: string; role: string; initials?: string; avatarUrl?: string; color?: string }[];
    }) => {
        if (editingProject) {
            setProjects(projects.map(p => {
                if (p.id === editingProject.id) {
                    return {
                        ...p,
                        title: projectData.title,
                        subtitle: projectData.subtitle,
                        gradient: projectData.gradient,
                        coverImage: projectData.coverImage || undefined,
                        team: (projectData.invitedUsers || []).map((inv, idx) => ({
                            initials: inv.initials || inv.name.substring(0, 2).toUpperCase(),
                            name: inv.name,
                            role: inv.role as Role,
                            color: inv.color || (idx % 2 === 0 ? "bg-blue-500" : "bg-emerald-500"),
                            avatarUrl: inv.avatarUrl
                        }))
                    };
                }
                return p;
            }));
        } else {
            const newProject: Project = {
                id: Date.now().toString(),
                title: projectData.title,
                subtitle: projectData.subtitle,
                role: "Owner",
                gradient: projectData.gradient,
                coverImage: projectData.coverImage || undefined,
                ownerInitials: "EM",
                lastUpdated: "Justo ahora",
                team: [
                    { initials: "EM", name: "Elías Márquez", role: "Owner", color: "bg-[#C39767]" },
                    ...(projectData.invitedUsers || []).map((inv, idx: number) => ({
                        initials: inv.initials || inv.name.split(" ")[0].substring(0, 2).toUpperCase(),
                        name: inv.name,
                        role: inv.role as Role,
                        color: idx % 2 === 0 ? "bg-blue-500" : "bg-emerald-500",
                    })),
                ],
            };
            setProjects([newProject, ...projects]);
        }
        setIsModalOpen(false);
    };

    const requestDelete = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation();
        setDeleteModal({ open: true, projectId: id, projectTitle: title });
    };

    const confirmDelete = (projectId: string) => {
        setProjects(p => p.filter(pr => pr.id !== projectId));
        setDeleteModal({ open: false, projectId: null, projectTitle: "" });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ open: false, projectId: null, projectTitle: "" });
    };

    const addProject = (project: Project) => {
        setProjects(prev => [project, ...prev]);
    };

    return {
        projects,
        editingProject,
        isModalOpen,
        deleteModal,
        openCreateModal,
        openEditModal,
        closeModal,
        saveProject,
        requestDelete,
        confirmDelete,
        closeDeleteModal,
        addProject,
    };
}
