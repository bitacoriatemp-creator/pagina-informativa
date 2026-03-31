const { execSync } = require('child_process');
const fs = require('fs');

try {
    console.log("Buscando proceso en el puerto 3000...");
    const output = execSync('netstat -ano | findstr :3000').toString();
    const lines = output.trim().split('\n');
    for (const line of lines) {
        if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && !isNaN(pid) && pid !== '0') {
                console.log(`Matando proceso PID: ${pid}`);
                execSync(`taskkill /F /PID ${pid}`);
                console.log("Proceso eliminado con éxito.");
            }
        }
    }
} catch (e) {
    console.log("No se encontró ningún proceso o error al matarlo.");
}

try {
    console.log("Eliminando caché corrupta (.next)...");
    fs.rmSync('.next', { recursive: true, force: true });
    console.log("Caché eliminada.");
} catch (e) {
    console.log("La carpeta .next podría estar en uso o no existir:", e.message);
}
