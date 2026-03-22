"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, HardHat, Clock, ChevronDown, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Project } from "@/types/project";
import { useThemeVars } from "@/hooks/useThemeVars";
import { assetPath } from "@/lib/assetPath";

// Props required for the component
interface ProjectCardProps {
    project: Project;
    onDeleteClick: (e: React.MouseEvent, id: string, title: string) => void;
    onEditClick: (project: Project) => void;
    onClick?: () => void;
}

export default React.memo(function ProjectCard({
    project,
    onDeleteClick,
    onEditClick,
    onClick
}: ProjectCardProps) {
    const { isDark, cardBg, cardBorder, textClass, textFaint } = useThemeVars();
    const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

    // Estado local para simular la funcionalidad de cambiar roles o eliminar sin pegarle a la BD externa
    const [localTeam, setLocalTeam] = useState(
        project.team || [{ initials: project.ownerInitials, role: project.role, color: 'bg-[#C39767]', lastActivity: undefined as string | undefined }]
    );
    const [confirmOwnerChange, setConfirmOwnerChange] = useState<{index: number, memberName: string} | null>(null);

    useEffect(() => {
        if (project.team) {
            setLocalTeam(project.team);
        }
    }, [project.team]);

    const handleChangeRole = (index: number, newRole: 'Owner' | 'Editor' | 'Viewer') => {
        setLocalTeam(prev => {
            const next = [...prev];
            if (newRole === 'Owner') {
                // Degradamos al owner actual a editor automáticamente.
                next.forEach((m, i) => {
                    if (m.role === 'Owner') next[i] = { ...m, role: 'Editor' };
                });
            }
            next[index] = { ...next[index], role: newRole };
            return next;
        });
        setOpenDropdownIdx(null);
    };

    const handleRemoveUser = (index: number) => {
        setLocalTeam(prev => prev.filter((_, i) => i !== index));
        setOpenDropdownIdx(null);
    };

    return (
        <div
            onClick={onClick}
            className={`group relative rounded-2xl border ${cardBorder} ${cardBg} backdrop-blur-sm flex flex-col transition-all duration-300 hover:border-[#C39767]/30 hover:${isDark ? 'bg-white/[0.04]' : 'bg-[#2A241E]/[0.04]'} hover:shadow-[0_0_40px_rgba(195,151,103,0.07)] h-[380px] cursor-pointer`}
        >
            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/10' : 'via-[#2A241E]/10'} to-transparent group-hover:via-[#C39767]/50 transition-all duration-500 rounded-t-2xl`} />

            {/* Header: proyecto gradient o solid color (o foto de portada) */}
            <div className={`h-[110px] rounded-t-[15px] ${!project.coverImage && !project.gradient.startsWith('#') ? 'bg-gradient-to-br ' + project.gradient : ''} p-4 flex flex-col justify-between relative overflow-hidden`}
                style={project.coverImage
                    ? { backgroundImage: `url(${assetPath(project.coverImage)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
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
                    <div className="flex flex-col gap-2 relative z-20 pb-5 pt-1">
                            {localTeam
                                .slice()
                                .sort((a, b) => {
                                    const order: Record<string, number> = { Owner: 0, Editor: 1, Viewer: 2 };
                                    return (order[a.role] ?? 9) - (order[b.role] ?? 9);
                                })
                                .map((member, i) => (
                                <div
                                    key={i}
                                    className={`group/user user-dropdown-container relative flex flex-col justify-between px-2 py-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#2A241E]/5'}`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                            <div className="relative shrink-0 w-8 h-8">
                                                <div className={`w-full h-full rounded-lg ${isDark ? 'bg-black/60' : 'bg-[#F8F6F0]'} backdrop-blur-md border ${cardBorder} flex items-center justify-center text-[10px] font-bold ${textClass} shadow-sm overflow-hidden relative`}>
                                                    {member.avatarUrl ? (
                                                        <Image src={assetPath(member.avatarUrl)} alt={member.name || member.initials} fill className="object-cover" unoptimized />
                                                    ) : (
                                                        member.initials
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-[#0a0a0a]' : 'border-white'} ${member.role === 'Owner' ? 'bg-[#C39767]' : member.role === 'Editor' ? 'bg-blue-500' : 'bg-emerald-500'} z-10 shadow-sm`} />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center justify-start gap-1.5 flex-wrap">
                                                    {member.name && (
                                                        <span className={`text-[12px] font-semibold ${textClass} truncate max-w-[120px]`}>{member.name}</span>
                                                    )}
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none ${member.role === 'Owner' ? 'text-[#C39767]' : member.role === 'Editor' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                        {member.role === 'Owner' && <HardHat size={10} className="inline mr-1 -mt-0.5" />}
                                                        {member.role}
                                                    </span>
                                                </div>
                                                {member.lastActivity && (
                                                    <span className={`text-[10px] font-mono ${textFaint} leading-tight flex items-center gap-1 mt-1`} title="\u00daltima actividad del usuario">
                                                        <Clock size={9} className="shrink-0" />
                                                        {member.lastActivity}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions Button */}
                                        {member.role !== 'Owner' && (
                                            <div className="relative shrink-0">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownIdx(openDropdownIdx === i ? null : i);
                                                    }}
                                                    className={`opacity-0 group-hover/user:opacity-100 ${openDropdownIdx === i ? 'opacity-100 bg-[#C39767]/20 text-[#C39767]' : isDark ? 'hover:bg-white/10 text-white/50 hover:text-white' : 'hover:bg-black/10 text-black/50 hover:text-black'} transition-all w-7 h-7 flex items-center justify-center rounded-full`}
                                                    title="Opciones de usuario"
                                                >
                                                    <MoreVertical size={14} />
                                                </button>

                                                {/* Action Dropdown Menu (Floating Outward) */}
                                                <AnimatePresence>
                                                    {openDropdownIdx === i && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                                            className={`absolute top-full sm:top-auto sm:bottom-0 right-10 w-44 rounded-[1rem] shadow-[0_15px_40px_rgba(0,0,0,0.8)] border ${isDark ? 'bg-[#111111] border-white/10' : 'bg-white border-black/10'} overflow-hidden z-[200]`}
                                                        >
                                                            <div className={`p-2 border-b ${isDark ? 'border-white/[0.05]' : 'border-black/[0.05]'}`}>
                                                                <p className={`text-[9px] font-mono font-bold tracking-widest ${isDark ? 'text-white/40' : 'text-black/40'} uppercase mb-1.5 px-1`}>Permisos</p>
                                                                
                                                                <div className="flex flex-col gap-0.5 w-full">
                                                                    <button 
                                                                        onClick={(e) => { 
                                                                            e.stopPropagation(); 
                                                                            setConfirmOwnerChange({ index: i, memberName: member.name || member.initials });
                                                                            setOpenDropdownIdx(null);
                                                                        }}
                                                                        className={`w-full py-2 px-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg border text-left ${isDark ? 'bg-transparent text-white/70 border-transparent hover:bg-white/10' : 'bg-transparent text-black/70 border-transparent hover:bg-black/5'} transition-all`}
                                                                    >
                                                                        Hacer Owner
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleChangeRole(i, 'Editor'); }}
                                                                        className={`w-full py-2 px-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg border text-left ${member.role === 'Editor' ? 'bg-blue-500 text-white border-transparent' : isDark ? 'bg-transparent text-white/70 border-transparent hover:bg-white/10' : 'bg-transparent text-black/70 border-transparent hover:bg-black/5'} transition-all`}
                                                                    >
                                                                        Hacer Editor
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleChangeRole(i, 'Viewer'); }}
                                                                        className={`w-full py-2 px-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg border text-left ${member.role === 'Viewer' ? 'bg-emerald-500 text-white border-transparent' : isDark ? 'bg-transparent text-white/70 border-transparent hover:bg-white/10' : 'bg-transparent text-black/70 border-transparent hover:bg-black/5'} transition-all`}
                                                                    >
                                                                        Hacer Viewer
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="p-1.5 leading-none">
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleRemoveUser(i); }}
                                                                    className={`w-full py-2.5 text-[10px] font-bold tracking-widest uppercase rounded-lg text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2 px-2`}
                                                                >
                                                                    <Trash2 size={13} /> Desvincular
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
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

            {/* Modal de Confirmación para Transferir Propiedad */}
            <AnimatePresence>
                {confirmOwnerChange && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={(e) => { e.stopPropagation(); setConfirmOwnerChange(null); }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className={`relative w-full max-w-sm ${isDark ? 'bg-[#1A1A1A] border-white/10' : 'bg-white border-black/10'} border rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center`}
                        >
                            <div className="w-16 h-16 rounded-full bg-[#C39767]/10 text-[#C39767] border border-[#C39767]/20 flex items-center justify-center mb-5">
                                <HardHat size={28} />
                            </div>
                            <h3 className={`text-xl font-display font-semibold ${textClass} mb-3`}>Transferir Propiedad</h3>
                            <p className={`text-sm ${textFaint} leading-relaxed mb-6`}>
                                ¿Estás seguro de transferir el rol de Owner a <span className="font-bold text-white">{confirmOwnerChange.memberName}</span>? 
                                Pasarás a ser Editor automáticamente y perderás privilegios de configuración de la bitácora.
                            </p>
                            <div className="flex w-full gap-3">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setConfirmOwnerChange(null); }}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-black/5 hover:bg-black/10 text-black/70'} transition-colors`}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleChangeRole(confirmOwnerChange.index, 'Owner'); 
                                        setConfirmOwnerChange(null); 
                                    }}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm tracking-wider uppercase bg-[#C39767] hover:bg-[#A37B50] text-white shadow-lg shadow-[#C39767]/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
});
