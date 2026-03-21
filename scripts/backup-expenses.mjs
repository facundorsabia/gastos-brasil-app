import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Usamos service_role para bypass RLS si es necesario

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runBackup() {
    console.log('---  iniciando backup de gastos ---');

    try {
        // Obtener todos los gastos
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            console.log('⚠️ No se encontraron gastos para respaldar.');
            return;
        }

        // Crear nombre de archivo con fecha y hora
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        const fileName = `backup_expenses_${timestamp}.json`;
        const filePath = path.join(backupDir, fileName);

        // Asegurar que la carpeta existe (por las dudas)
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Guardar archivo
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`✅ Backup completado con éxito!`);
        console.log(`📂 Archivo guardado: backups/${fileName}`);
        console.log(`📊 Cantidad de registros: ${data.length}`);

    } catch (err) {
        console.error('❌ Error realizando el backup:', err.message);
    }
}

runBackup();
