// Script de migración one-shot: lee data/expenses.json y los inserta en Supabase.
// Correrlo UNA sola vez antes del deploy:
//   npx tsx scripts/seed-supabase.mjs
//
// Requiere .env.local con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY configurados.

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// Carga las variables de .env.local
config({ path: ".env.local" });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "..", "data", "expenses.json");

async function main() {
    console.log("📂 Leyendo data/expenses.json ...");
    const raw = await readFile(dataFile, "utf8");
    const expenses = JSON.parse(raw);
    console.log(`   → ${expenses.length} gasto(s) encontrado(s)`);

    if (expenses.length === 0) {
        console.log("✅ Nada que migrar.");
        return;
    }

    console.log("⬆️  Insertando en Supabase ...");
    const { data, error } = await supabase
        .from("expenses")
        .upsert(expenses, { onConflict: "id", ignoreDuplicates: true })
        .select();

    if (error) {
        console.error("❌ Error al insertar:", error.message);
        process.exit(1);
    }

    console.log(`✅ Migración exitosa — ${data?.length ?? 0} registros insertados.`);
}

main().catch((err) => {
    console.error("❌ Error inesperado:", err);
    process.exit(1);
});
