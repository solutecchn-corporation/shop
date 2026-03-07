import { supabase } from "./supabase";
import { resolveProductImage } from "./productMedia";

function normalizeIdentity(identity) {
  return String(identity || "").replace(/\D/g, "");
}

function buildGuestEmail(identity) {
  const normalizedIdentity =
    normalizeIdentity(identity) || `pedido${Date.now()}`;
  return `${normalizedIdentity}.${Date.now()}@webpedido.local`;
}

function buildGuestPassword(identity, phone) {
  const identityPart = normalizeIdentity(identity).slice(-6) || "pedido";
  const phonePart =
    String(phone || "")
      .replace(/\D/g, "")
      .slice(-4) || "0000";
  return `web-${identityPart}-${phonePart}`;
}

function buildAddressWithIdentity(address, identity) {
  const cleanAddress = String(address || "").trim();
  const cleanIdentity = String(identity || "").trim();

  if (!cleanIdentity) return cleanAddress;
  if (!cleanAddress) return `Identidad: ${cleanIdentity}`;

  return `${cleanAddress} | Identidad: ${cleanIdentity}`;
}

function formatOrderDisplayNumber(order) {
  if (order?.pedido_numero !== undefined && order?.pedido_numero !== null) {
    return String(order.pedido_numero);
  }

  return "Pendiente";
}

async function getOrderById(orderId) {
  const withNumber = await supabase
    .from("pedidos_web")
    .select("id,pedido_numero,total,fecha_pedido")
    .eq("id", orderId)
    .single();

  if (!withNumber.error) {
    return withNumber.data;
  }

  const fallback = await supabase
    .from("pedidos_web")
    .select("id,total,fecha_pedido")
    .eq("id", orderId)
    .single();

  if (fallback.error) throw fallback.error;
  return fallback.data;
}

async function ensureOrderUser({ customer, currentUser }) {
  const normalizedAddress = buildAddressWithIdentity(
    customer.address,
    customer.identity,
  );

  if (currentUser?.id) {
    const updates = {
      nombre: customer.name.trim(),
      telefono: customer.phone.trim(),
      direccion: normalizedAddress,
    };

    const { data, error } = await supabase
      .from("usuarios_web")
      .update(updates)
      .eq("id", currentUser.id)
      .select("id,nombre,email,telefono,direccion,estado")
      .single();

    if (error) throw error;
    return data;
  }

  const userPayload = {
    nombre: customer.name.trim(),
    email: buildGuestEmail(customer.identity),
    telefono: customer.phone.trim(),
    direccion: normalizedAddress,
    password: buildGuestPassword(customer.identity, customer.phone),
  };

  const { data: userData, error: userError } = await supabase
    .from("usuarios_web")
    .insert(userPayload)
    .select("id,nombre,email,telefono,direccion,estado")
    .single();

  if (userError) throw userError;

  return userData;
}

export async function createWebOrder({ customer, items, currentUser = null }) {
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0,
  );
  const impuesto = 0;
  const total = subtotal + impuesto;

  const userData = await ensureOrderUser({ customer, currentUser });

  const { data: orderData, error: orderError } = await supabase
    .from("pedidos_web")
    .insert({
      usuario_id: userData.id,
      subtotal,
      impuesto,
      total,
      estado: "pendiente",
    })
    .select("id,total,fecha_pedido")
    .single();

  if (orderError) throw orderError;

  const detailsPayload = items.map((item) => {
    const quantity = Number(item.qty || 0);
    const price = Number(item.price || 0);
    const lineSubtotal = quantity * price;

    return {
      pedido_id: orderData.id,
      producto_id: item.id,
      cantidad: quantity,
      precio_unitario: price,
      subtotal: lineSubtotal,
      descuento: 0,
      total: lineSubtotal,
    };
  });

  const { error: detailError } = await supabase
    .from("pedidos_web_detalle")
    .insert(detailsPayload);

  if (detailError) throw detailError;

  const freshOrder = await getOrderById(orderData.id);

  return {
    orderId: orderData.id,
    orderNumber: formatOrderDisplayNumber(freshOrder),
    total: freshOrder.total,
    customer: {
      id: userData.id,
      name: userData.nombre || "",
      email: userData.email || "",
      phone: userData.telefono || "",
      address: userData.direccion || "",
      status: userData.estado || "activo",
    },
  };
}

export async function listUserOrders(userId) {
  const queryWithNumber = await supabase
    .from("pedidos_web")
    .select(
      `
      id,
      pedido_numero,
      fecha_pedido,
      total,
      estado,
      pedidos_web_detalle(
        producto_id,
        cantidad,
        total,
        inventario(nombre,imagen)
      )
    `,
    )
    .eq("usuario_id", userId)
    .order("fecha_pedido", { ascending: false });

  let rows = queryWithNumber.data;
  let error = queryWithNumber.error;

  if (error) {
    const fallback = await supabase
      .from("pedidos_web")
      .select(
        `
        id,
        fecha_pedido,
        total,
        estado,
        pedidos_web_detalle(
          producto_id,
          cantidad,
          total,
          inventario(nombre,imagen)
        )
      `,
      )
      .eq("usuario_id", userId)
      .order("fecha_pedido", { ascending: false });

    rows = fallback.data;
    error = fallback.error;
  }

  if (error) throw error;

  return (rows || []).map((order) => ({
    id: order.id,
    displayNumber: formatOrderDisplayNumber(order),
    total: Number(order.total || 0),
    estado: order.estado || "pendiente",
    dateLabel: new Intl.DateTimeFormat("es-HN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(order.fecha_pedido)),
    items: (order.pedidos_web_detalle || []).map((item) => ({
      productId: item.producto_id,
      quantity: Number(item.cantidad || 0),
      total: Number(item.total || 0),
      name: item.inventario?.nombre || "Producto",
      image: resolveProductImage(item.inventario?.imagen || ""),
    })),
  }));
}
