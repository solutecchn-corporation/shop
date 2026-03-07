import { supabase } from "./supabase";

export function isStrongPassword(password) {
  const value = String(password || "");

  return (
    value.length >= 6 &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

function normalizeUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.nombre || "",
    email: row.email || "",
    phone: row.telefono || "",
    address: row.direccion || "",
    status: row.estado || "activo",
  };
}

export async function loginWebUser({ email, password }) {
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  const cleanPassword = String(password || "");

  const { data, error } = await supabase
    .from("usuarios_web")
    .select("id,nombre,email,telefono,direccion,estado")
    .eq("email", cleanEmail)
    .eq("password", cleanPassword)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { ok: false, message: "Credenciales incorrectas" };

  return { ok: true, user: normalizeUser(data) };
}

export async function registerWebUser({ name, email, password }) {
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  const cleanPassword = String(password || "");

  if (!isStrongPassword(cleanPassword)) {
    return {
      ok: false,
      message:
        "La contraseña debe tener mínimo 6 caracteres, una mayúscula, un número y un signo.",
    };
  }

  const { data: existingUser, error: existingError } = await supabase
    .from("usuarios_web")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingUser)
    return { ok: false, message: "El email ya está registrado" };

  const { data, error } = await supabase
    .from("usuarios_web")
    .insert({
      nombre: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      telefono: "",
      direccion: "",
      estado: "activo",
    })
    .select("id,nombre,email,telefono,direccion,estado")
    .single();

  if (error) throw error;

  return { ok: true, user: normalizeUser(data) };
}
