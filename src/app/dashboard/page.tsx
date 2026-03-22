"use client";

import { useState } from "react";
import { Plus, Key, HardHat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeVars } from "@/hooks/useThemeVars";
import { useProjects } from "@/hooks/useProjects";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import ProjectCard from "@/components/dashboard/ProjectCard";
import dynamic from "next/dynamic";

const ProjectFormModal = dynamic(() => import("@/components/dashboard/ProjectFormModal"), { ssr: false });
const DeleteConfirmModal = dynamic(() => import("@/components/dashboard/DeleteConfirmModal"), { ssr: false });
const JoinProjectModal = dynamic(() => import("@/components/dashboard/JoinProjectModal"), { ssr: false });
import { useDashboard } from "@/context/DashboardContext";

export default function DashboardHub() {
    const { isSidebarOpen, setIsSidebarOpen } = useDashboard();
    const {
        isDark,
        mounted,
        cardBg,
        cardBorder,
        textMuted,
        textFaint,
    } = useThemeVars();

    const {
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
    } = useProjects();

    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);

    if (!mounted) return null;

    return (
        <>
            <DashboardTopBar
                activePage="inicio"
                pageTitle="Proyectos"
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                rightActions={
                    <div className="flex items-center gap-3 sm:gap-5 relative">
                        <button
                            onBlur={() => setTimeout(() => setIsPlusMenuOpen(false), 200)}
                            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
                            className={`flex items-center justify-center p-2 rounded-full hover:bg-[#C39767]/20 hover:text-[#C39767] ${isDark ? 'text-white/80' : 'text-[#2A241E]/80'} transition-all group`}
                            title="Desplegar opciones"
                        >
                            <Plus size={24} className={`transition-transform duration-300 ${isPlusMenuOpen ? 'rotate-45 text-[#C39767]' : 'group-hover:scale-110'}`} />
                        </button>
                        
                        <AnimatePresence>
                            {isPlusMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className={`absolute right-0 top-full mt-2 w-56 ${isDark ? 'bg-[#111]' : 'bg-white'} border ${cardBorder} rounded-xl shadow-2xl z-[100] py-1.5 overflow-hidden origin-top-right ring-1 ${isDark ? 'ring-white/5' : 'ring-black/5'}`}
                                >
                                    <button
                                        onClick={() => { openCreateModal(); setIsPlusMenuOpen(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-[#2A241E]/5 text-black'}`}
                                    >
                                        <Plus size={16} />
                                        Crear Nueva Obra
                                    </button>
                                    <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-black/5'} my-0.5`} />
                                    <button
                                        onClick={() => { setIsJoinModalOpen(true); setIsPlusMenuOpen(false); }}
                                        className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-[#C39767]/10 text-[#C39767]' : 'hover:bg-[#C39767]/10 text-[#C39767]'}`}
                                    >
                                        <Key size={16} />
                                        Ingresar Código
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                }
            />

            <main data-lenis-prevent className={`flex-1 min-h-0 overflow-y-auto p-4 sm:p-8 lg:p-10 custom-scrollbar relative ${isDark ? 'dark-content-area' : 'light-content-area'}`}>
                {/* Ambient glow */}
                <div className="fixed top-0 left-64 w-[600px] h-[300px] bg-[#C39767]/[0.03] blur-[100px] pointer-events-none" />

                {projects.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <div className={`w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center p-10 rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm relative z-10 overflow-hidden`}>
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: isDark ? "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)" : "radial-gradient(circle at 1px 1px, rgba(42,36,30,0.1) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C39767]/60 to-transparent" />
                            <div className={`w-20 h-20 rounded-2xl ${isDark ? 'bg-[#111] border border-white/[0.08]' : 'bg-[#E8E0D5] border border-[#2A241E]/10'} flex items-center justify-center mb-7 shadow-inner relative z-10`}>
                                <HardHat size={36} className="text-[#C39767]/60" strokeWidth={1.5} />
                            </div>

                            <span className={`font-mono text-[10px] tracking-[0.3em] ${textFaint} uppercase mb-3 relative z-10`}>ESTADO · VACÍO</span>
                            <h2 className="text-xl font-display font-medium mb-3 tracking-wide relative z-10">
                                Sin obras activas
                            </h2>

                            <p className={`${textMuted} mb-8 max-w-sm text-sm leading-relaxed relative z-10`}>
                                Ingresa un código de invitación o crea un proyecto nuevo para comenzar a gestionar tu obra con IA.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center relative z-10">
                                <button
                                    onClick={() => setIsJoinModalOpen(true)}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#C39767] text-black font-semibold hover:bg-[#d4a878] transition-colors shadow-lg shadow-[#C39767]/20 text-sm"
                                >
                                    <Key size={16} />
                                    <span>Ingresar Código</span>
                                </button>

                                <button
                                    onClick={openCreateModal}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg ${isDark ? 'bg-transparent border border-white/10 text-white/70 hover:bg-white/[0.04] hover:text-white' : 'bg-transparent border border-[#2A241E]/20 text-[#2A241E]/70 hover:bg-[#2A241E]/[0.06] hover:text-[#2A241E]'} font-medium transition-colors text-sm`}
                                >
                                    <Plus size={16} />
                                    <span>Crear Nueva Obra</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onDeleteClick={requestDelete}
                                onEditClick={openEditModal}
                            />
                        ))}
                    </div>
                )}
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <ProjectFormModal
                        isOpen={isModalOpen}
                        onClose={closeModal}
                        onSave={saveProject}
                        initialProject={editingProject}
                    />
                )}
            </AnimatePresence>

            <DeleteConfirmModal
                isOpen={deleteModal.open}
                projectId={deleteModal.projectId}
                projectTitle={deleteModal.projectTitle}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
            />

            <AnimatePresence>
                {isJoinModalOpen && (
                    <JoinProjectModal
                        isOpen={isJoinModalOpen}
                        onClose={() => setIsJoinModalOpen(false)}
                        onProjectJoined={(project) => {
                            addProject(project);
                            setIsJoinModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
