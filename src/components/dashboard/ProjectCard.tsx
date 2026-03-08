"use client";

import React from "react";
import { MoreVertical, HardHat, Clock, ChevronDown, Trash2 } from "lucide-react";
import { Project } from "@/types/project";
import { useThemeVars } from "@/hooks/useThemeVars";

// Props required for the component
interface ProjectCardProps {
    project: Project;
    onDeleteClick: (e: React.MouseEvent, id: string, title: string) => void;
    onEditClick: (project: Project) => void;
    onClick?: () => void;
}

export default function ProjectCard({
    project,
    onDeleteClick,
    onEditClick,
    onClick
}: ProjectCardProps) {
    const { isDark, cardBg, cardBorder, textClass, textFaint } = useThemeVars();

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:border-[#C39767]/30 hover:${isDark ? 'bg-white/[0.04]' : 'bg-[#2A241E]/[0.04]'} hover:shadow-[0_0_40px_rgba(195,151,103,0.07)] h-[380px] cursor-pointer`}
        >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/10' : 'via-[#2A241E]/10'} to-transparent group-hover:via-[#C39767]/50 transition-all duration-500`} />

            {/* Header: proyecto gradient o solid color (o foto de portada) */}
            <div className={`h-[110px] ${!project.coverImage && !project.gradient.startsWith('#') ? 'bg-gradient-to-br ' + project.gradient : ''} p-4 flex flex-col justify-between relative overflow-hidden`}
                style={project.coverImage
                    ? { backgroundImage: `url(${project.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : project.gradient.startsWith('#') ? { backgroundColor: project.gradient } : undefined}>
                {/* Overlay when cover photo is used */}
                {project.coverImage && <div className="absolute inset-0 bg-black/40" />}
                {/* Scanline effect */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)" }} />
                <div className="flex justify-between items-start relative z-10">
                    <h2 className="text-lg font-display font-semibold text-white truncate max-w-[70%] leading-tight tracking-wide">
                        {project.title}
                    </h2>
                    <div className="flex items-center gap-1">
                        {/* Delete button */}
                        <button
                            onClick={(e) => onDeleteClick(e, project.id, project.title)}
                            className="opacity-0 group-hover:opacity-100 text-white/50 hover:text-red-400 p-1 rounded hover:bg-red-500/20 transition-all"
                            title="Eliminar obra"
                        >
                            <Trash2 size={15} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEditClick(project); }}
                            className="opacity-0 group-hover:opacity-100 text-white/70 hover:text-white p-1 rounded hover:bg-black/30 transition-all"
                            title="Editar"
                        >
                            <MoreVertical size={18} />
                        </button>
                    </div>
                </div>
                <p className="text-xs text-white/60 font-mono truncate relative z-10 uppercase tracking-wider">{project.subtitle}</p>
            </div>

            {/* Body con la lista del equipo */}
            <div className="flex-1 px-4 pt-4 pb-4 flex flex-col justify-between">

                {/* Team List Box */}
                <div className="flex-1 min-h-0 relative group/teamlist">
                    <div data-lenis-prevent className="absolute inset-0 overflow-y-auto custom-scrollbar pr-1 pb-5" style={{ maskImage: 'linear-gradient(to bottom, black calc(100% - 15px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 15px), transparent 100%)' }}>
                        <div className="flex flex-col gap-2 relative z-20">
                            {(project.team || [{ initials: project.ownerInitials, role: project.role, color: 'bg-[#C39767]', lastActivity: undefined as string | undefined }]).map((member, i) => (
                                <div
                                    key={i}
                                    className={`flex items-center gap-3 px-1.5 py-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#2A241E]/5'}`}
                                >
                                    <div className={`relative shrink-0 rounded-lg ${isDark ? 'bg-black/60' : 'bg-[#F8F6F0]'} backdrop-blur-md border ${cardBorder} flex items-center justify-center w-8 h-8 text-[10px] font-bold ${textClass} shadow-sm`}>
                                        {member.initials}
                                        <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} ${member.role === 'Owner' ? 'bg-[#C39767]' : member.role === 'Editor' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            {member.name && (
                                                <span className={`text-[10px] font-semibold ${textClass} truncate`}>{member.name}</span>
                                            )}
                                            <span className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${member.role === 'Owner' ? 'text-[#C39767]' : member.role === 'Editor' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                {member.role === 'Owner' && <HardHat size={10} className="inline mr-1 -mt-0.5" />}
                                                {member.role}
                                            </span>
                                        </div>
                                        {member.lastActivity && (
                                            <span className={`text-[9px] font-mono ${textFaint} leading-tight flex items-center gap-1 mt-0.5`} title="\u00daltima actividad del usuario">
                                                <Clock size={8} className="shrink-0" />
                                                {member.lastActivity}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Scroll Indicator (Discreto, se muestra cuando hay más de 3 miembros) */}
                    {project.team && project.team.length > 3 && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center opacity-40 group-hover/teamlist:opacity-100 transition-opacity duration-300">
                            <ChevronDown size={16} className={`animate-bounce ${textClass}`} />
                        </div>
                    )}
                </div>

                {/* Controles de abajo (Fecha) */}
                <div className="mt-4">
                    {/* Status bar */}
                    <div className="space-y-1 mb-3">
                        <div className={`flex justify-between items-center text-[10px] ${textFaint} font-mono uppercase tracking-wider`}>
                            <div className="flex items-center gap-1" title="Último registro en bitácora del proyecto">
                                <Clock size={9} className="text-[#C39767]" />
                                <span className="text-[#C39767] font-bold">REG</span>
                                <span className="truncate max-w-[120px]">{project.lastEntry || project.lastUpdated || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={`flex items-center justify-between border-t ${cardBorder} pt-3`}>
                        <span className={`text-[10px] font-mono ${textFaint} uppercase tracking-wider`}>BIT-{project.id.slice(-4)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
