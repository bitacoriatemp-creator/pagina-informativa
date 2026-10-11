import { afterEach, describe, expect, it, vi } from "vitest";

import { EventoFalso, montarHeroDemoShowcase, type Montado } from "./heroDemoShowcase.entorno";

/**
 * Tarjeta de demos del hero en el móvil (JC 2026-09-24).
 *
 * JC pidió quitar el botón de volumen y la pastilla "Toca para ampliar" que
 * iban encima del video, dejar la tarjeta en horizontal (16:9) aunque se vea
 * pequeña y que un toque abra el reproductor nativo del navegador, con sonido
 * y con sus controles para pausar y adelantar. En escritorio no cambia nada.
 */

const RATE_MUTED = 1.2;

let hero: Montado | null = null;

async function montar(tactil: boolean) {
    hero = await montarHeroDemoShowcase({ tactil });
    return hero;
}

afterEach(async () => {
    await hero?.desmontar();
    hero = null;
});

describe("HeroDemoShowcase en touch", () => {
    it("no pone nada encima del video: ni botón de sonido ni pastilla de ampliar", async () => {
        const h = await montar(true);
        const tarjeta = h.tarjeta();
        const dentro = h.elementos().filter((e) => tarjeta.contains(e) && e !== tarjeta);

        expect(dentro.every((e) => e.tagName === "VIDEO")).toBe(true);
        expect(h.contenedor.textContent).not.toMatch(/toca para ampliar/i);
    });

    it("la tarjeta es 16:9 y se comporta como botón accesible", async () => {
        const h = await montar(true);
        const tarjeta = h.tarjeta();
        const clases = tarjeta.className.split(/\s+/);

        expect(clases).toContain("aspect-video");
        expect(clases.some((c) => c.startsWith("aspect-[") || c.includes(":aspect-"))).toBe(false);
        expect(tarjeta.getAttribute("role")).toBe("button");
        expect(tarjeta.getAttribute("tabindex")).toBe("0");
        expect(tarjeta.getAttribute("aria-label")).toBe(
            "Ver el demo de Smart Concepts en pantalla completa, con sonido"
        );
    });

    it("los puntos quedan centrados: la compensación de la columna de sonido es solo desde lg", async () => {
        const h = await montar(true);
        const fila = h.puntos()[0].parentElement!.parentElement!;
        const clases = fila.className.split(/\s+/);

        expect(clases).toContain("lg:pr-8");
        expect(clases).not.toContain("pr-8");
    });

    it("tocar abre el reproductor nativo: controles, sonido, 1x, desde el principio y pantalla completa", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        v0.currentTime = 23;
        let controlesAlPedirPantalla: boolean | null = null;
        const pedir = v0.requestFullscreen!;
        v0.requestFullscreen = vi.fn(() => {
            controlesAlPedirPantalla = v0.controls;
            return pedir();
        });

        await h.tocar(h.tarjeta());

        expect(v0.controls).toBe(true);
        expect(v0.muted).toBe(false);
        expect(v0.volume).toBe(1);
        expect(v0.playbackRate).toBe(1);
        expect(v0.currentTime).toBe(0);
        expect(v0.play).toHaveBeenCalled();
        expect(v0.requestFullscreen).toHaveBeenCalledTimes(1);
        // Sin controls, la pantalla completa de Chrome no trae controles.
        expect(controlesAlPedirPantalla).toBe(true);
        expect(v0.webkitEnterFullscreen).not.toHaveBeenCalled();
    });

    it("en el iPhone (sin requestFullscreen) usa webkitEnterFullscreen del video", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        v0.requestFullscreen = undefined;

        await h.tocar(h.tarjeta());

        expect(v0.webkitEnterFullscreen).toHaveBeenCalledTimes(1);
        expect(v0.controls).toBe(true);
        expect(v0.muted).toBe(false);
    });

    it("Enter y Espacio sobre la tarjeta también lo abren", async () => {
        const h = await montar(true);
        const [v0] = h.videos();

        await h.tecla(h.tarjeta(), "Enter");
        expect(v0.requestFullscreen).toHaveBeenCalledTimes(1);

        await h.salirDePantallaCompleta();
        await h.tecla(h.tarjeta(), " ");
        expect(v0.requestFullscreen).toHaveBeenCalledTimes(2);
    });

    it("sin API de pantalla completa el video se queda en la tarjeta con controles y sonando", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        v0.requestFullscreen = undefined;
        v0.webkitEnterFullscreen = undefined;

        await h.tocar(h.tarjeta());

        expect(v0.controls).toBe(true);
        expect(v0.muted).toBe(false);
        expect(v0.play).toHaveBeenCalled();
    });

    it("si la pantalla completa falla, sigue en la tarjeta y fuera de vista sí se pausa", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        v0.requestFullscreen = vi.fn(() => Promise.reject(new Error("denegada")));

        await h.tocar(h.tarjeta());
        expect(v0.controls).toBe(true);
        expect(v0.muted).toBe(false);

        v0.pause.mockClear();
        await h.act(async () => h.observador().disparar(false));
        expect(v0.pause).toHaveBeenCalled();
    });

    it("con el reproductor abierto, tocar sus controles no lo reinicia", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        await h.tocar(h.tarjeta());
        v0.currentTime = 17;

        await h.tocar(v0);

        expect(v0.currentTime).toBe(17);
        expect(v0.requestFullscreen).toHaveBeenCalledTimes(1);
    });

    it("al salir de la pantalla completa vuelve el hero: sin controles, mudo, 1.2x y el loop sigue", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        await h.tocar(h.tarjeta());
        v0.play.mockClear();

        await h.salirDePantallaCompleta();

        expect(v0.controls).toBe(false);
        expect(v0.muted).toBe(true);
        expect(v0.playbackRate).toBe(RATE_MUTED);
        expect(v0.play).toHaveBeenCalled();
        expect(h.activo()).toBe(0);
    });

    it("en pantalla completa, terminar el demo no cambia de video; al salir pasa al siguiente", async () => {
        const h = await montar(true);
        const [v0, v1] = h.videos();
        await h.tocar(h.tarjeta());

        v0.ended = true;
        await h.disparar(v0, new EventoFalso("ended", { bubbles: false }));
        expect(h.activo()).toBe(0);
        expect(v1.play).not.toHaveBeenCalled();
        expect(v0.controls).toBe(true);

        await h.salirDePantallaCompleta();
        expect(h.activo()).toBe(1);
        expect(v1.play).toHaveBeenCalled();
        expect(v1.muted).toBe(true);
        expect(v1.playbackRate).toBe(RATE_MUTED);
        expect(v0.controls).toBe(false);
    });

    it("en pantalla completa ni el observer ni la visibilidad pausan el video que se está viendo", async () => {
        const h = await montar(true);
        const [v0] = h.videos();
        await h.tocar(h.tarjeta());
        v0.pause.mockClear();

        await h.act(async () => h.observador().disparar(false));
        h.documento.visibilityState = "hidden";
        await h.disparar(h.documento, new EventoFalso("visibilitychange"));

        expect(v0.pause).not.toHaveBeenCalled();
    });

    it("webkitendfullscreen en el tercer video (Smart Calendar) también restaura el hero", async () => {
        const h = await montar(true);
        const v2 = h.videos()[2];
        await h.tocar(h.puntos()[2]);
        expect(h.activo()).toBe(2);
        v2.requestFullscreen = undefined;

        await h.tocar(h.tarjeta());
        expect(v2.webkitEnterFullscreen).toHaveBeenCalledTimes(1);
        expect(v2.muted).toBe(false);

        await h.disparar(v2, new EventoFalso("webkitendfullscreen", { bubbles: false }));

        expect(v2.controls).toBe(false);
        expect(v2.muted).toBe(true);
        expect(v2.playbackRate).toBe(RATE_MUTED);
    });

    it("tocar mientras el siguiente clip aún carga: el encadenado pendiente no mutea ni oculta el video abierto", async () => {
        const h = await montar(true);
        const [v0, v1, v2] = h.videos();
        let arrancarV1: () => void = () => {};
        v1.play.mockImplementationOnce(() => {
            v1.paused = false;
            return new Promise<void>((resolver) => {
                arrancarV1 = resolver;
            });
        });

        // Smart Concepts termina y Smart Log todavía no arranca (4G lento).
        v0.ended = true;
        await h.disparar(v0, new EventoFalso("ended", { bubbles: false }));
        expect(v1.play).toHaveBeenCalledTimes(1);

        await h.tocar(h.tarjeta());
        // En el navegador, currentTime = 0 saca al video del estado ended.
        v0.ended = false;
        expect(v0.controls).toBe(true);
        expect(v1.pause).toHaveBeenCalled();

        await h.act(async () => arrancarV1());

        expect(v0.muted).toBe(false);
        expect(v0.style.opacity).toBe("1");
        expect(v1.style.opacity).toBe("0");
        expect(h.activo()).toBe(0);

        await h.salirDePantallaCompleta();
        expect(h.activo()).toBe(0);
        expect(v0.paused).toBe(false);
        expect(v1.paused).toBe(true);
        expect(v2.paused).toBe(true);
    });

    it("solo el video activo recibe toques: los invisibles no tapan los controles nativos", async () => {
        const h = await montar(true);
        const [v0, v1, v2] = h.videos();
        expect(v0.style.pointerEvents).toBe("auto");
        expect(v1.style.pointerEvents).toBe("none");
        expect(v2.style.pointerEvents).toBe("none");

        await h.tocar(h.puntos()[2]);

        expect(v2.style.pointerEvents).toBe("auto");
        expect(v0.style.pointerEvents).toBe("none");
        expect(v1.style.pointerEvents).toBe("none");
    });

    it("al desmontar quita los oyentes de pantalla completa y desconecta el observer", async () => {
        const h = await montar(true);
        // Se guardan antes: al desmontar ya no están en el árbol.
        const vids = h.videos();
        const obs = h.observador();
        await h.tocar(h.tarjeta());
        expect(h.documento.oyentesDe("fullscreenchange")).toBeGreaterThan(0);
        expect(vids[2].oyentesDe("webkitendfullscreen")).toBeGreaterThan(0);

        await h.desmontar();
        hero = null;  // afterEach no debe desmontar dos veces

        expect(h.documento.oyentesDe("fullscreenchange")).toBe(0);
        expect(h.documento.oyentesDe("visibilitychange")).toBe(0);
        for (const v of vids) {
            expect(v.oyentesDe("webkitendfullscreen")).toBe(0);
            expect(v.oyentesDe("webkitbeginfullscreen")).toBe(0);
        }
        expect(obs.desconectado).toBe(true);
    });

    it("deslizar cambia de demo y no abre la pantalla completa", async () => {
        const h = await montar(true);
        const videos = h.videos();

        await h.deslizar(h.tarjeta(), -120);

        expect(h.activo()).toBe(1);
        expect(h.tarjeta().getAttribute("aria-label")).toContain("Smart Log");
        for (const v of videos) {
            expect(v.requestFullscreen).not.toHaveBeenCalled();
            expect(v.controls).toBe(false);
            expect(v.muted).toBe(true);
        }

        // Y el toque siguiente sí abre (la marca del deslizamiento no se queda pegada).
        await h.disparar(h.tarjeta(), new EventoFalso("pointerdown", { clientX: 100, clientY: 100 }));
        await h.disparar(h.tarjeta(), new EventoFalso("pointerup", { clientX: 101, clientY: 100 }));
        await h.tocar(h.tarjeta());
        expect(videos[1].requestFullscreen).toHaveBeenCalledTimes(1);
    });
});

describe("HeroDemoShowcase en escritorio con ratón", () => {
    it("conserva la columna de volumen y la tarjeta no abre pantalla completa", async () => {
        const h = await montar(false);
        const tarjeta = h.tarjeta();
        const [v0] = h.videos();

        const slider = h.elementos().find((e) => e.getAttribute("role") === "slider");
        expect(slider?.getAttribute("aria-label")).toBe("Volumen");
        const columna = slider!.parentElement!;
        expect(columna.className.split(/\s+/)).toEqual(expect.arrayContaining(["hidden", "lg:flex"]));
        expect(
            h.elementos().some((e) => e.tagName === "BUTTON" && e.getAttribute("aria-label") === "Activar sonido del demo")
        ).toBe(true);

        expect(tarjeta.className.split(/\s+/)).toContain("aspect-video");
        expect(tarjeta.className.split(/\s+/)).toEqual(expect.arrayContaining(["lg:rounded-[28px]"]));
        expect(tarjeta.getAttribute("role")).toBeNull();

        await h.tocar(tarjeta);
        expect(v0.requestFullscreen).not.toHaveBeenCalled();
        expect(v0.controls).toBe(false);
        expect(v0.muted).toBe(true);
        expect(v0.playbackRate).toBe(RATE_MUTED);
    });
});
