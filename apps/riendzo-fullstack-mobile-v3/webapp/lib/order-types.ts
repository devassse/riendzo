/**
 * Orders and reservations (restaurants, lodging, rent-a-car, tour guides / operators). Pure data: safe for client components.
 *
 * Premium members: every kind, live progress and notifications.
 * Free members: restaurants only, FREE_ORDER_LIMIT orders in total, a phone number is required
 * and the restaurant answers by phone (no live progress).
 */
export type OrderKind = "food" | "lodging" | "car" | "tour";

/** Collections that accept orders → what kind of order. */
export const ORDER_KINDS: Record<string, OrderKind> = {
    "gastronomy-restaurants": "food",
    "tourism-lodging": "lodging",
    "tourism-rentacar": "car",
    "tourism-guides": "tour",
    "tourism-transport": "tour",
};

/** Words used by the order panel and the buttons, per kind. */
export const KIND_TEXT: Record<OrderKind, { cta: string; panel: string; add: string; pick: string; from: string; to?: string; people?: string }> = {
    food: { cta: "Fazer pedido", panel: "Fazer um pedido", add: "Adicionar ao pedido", pick: "Escolha os pratos", from: "" },
    lodging: { cta: "Reservar quarto", panel: "Pedir reserva", add: "Solicitar reserva", pick: "Escolha o quarto", from: "Entrada", to: "Saída", people: "Hóspedes" },
    car: { cta: "Reservar viatura", panel: "Pedir reserva", add: "Solicitar reserva", pick: "Escolha a viatura", from: "Levantar", to: "Devolver" },
    tour: { cta: "Reservar passeio", panel: "Pedir reserva", add: "Solicitar reserva", pick: "Escolha o passeio ou serviço", from: "Data", people: "Pessoas" },
};

export const FREE_ORDER_LIMIT = 2;

export type OrderStatus = "sent" | "processing" | "ready" | "done" | "declined" | "cancelled";
/** Normal path of an order (the progress bar). */
export const STEPS: OrderStatus[] = ["sent", "processing", "ready", "done"];
export const ACTIVE: OrderStatus[] = ["sent", "processing", "ready"];

export function statusLabel(s: OrderStatus, kind: OrderKind) {
    const food = kind === "food";
    return ({
        sent: "Enviado",
        processing: "Em processamento",
        ready: food ? "Pronto" : "Confirmada",
        done: food ? "Concluído" : "Concluída",
        declined: "Recusado",
        cancelled: "Cancelado",
    } as const)[s];
}
export const STATUS_COLOR: Record<OrderStatus, string> = {
    sent: "bg-[#ffc14d]/30 text-[#7a5200]",
    processing: "bg-[#0370d6]/12 text-[#0b4a99]",
    ready: "bg-[#35be12]/15 text-[#238a0c]",
    done: "bg-[#eef2f8] text-[#4b5568]",
    declined: "bg-[#d23b25]/12 text-[#b5311d]",
    cancelled: "bg-[#eef2f8] text-[#4b5568]",
};

/** What the establishment may do next. */
export const NEXT: Record<OrderStatus, OrderStatus[]> = {
    sent: ["processing", "declined"],
    processing: ["ready", "declined"],
    ready: ["done"],
    done: [], declined: [], cancelled: [],
};
export const ACTION_LABEL: Partial<Record<OrderStatus, (k: OrderKind) => string>> = {
    processing: () => "Confirmar receção",
    ready: (k) => (k === "food" ? "Marcar como pronto" : "Confirmar reserva"),
    done: () => "Concluir",
    declined: () => "Recusar",
};

export const MODES = { dine_in: "Comer no local", pickup: "Levantar", delivery: "Entrega" } as const;
export type OrderMode = keyof typeof MODES;

export type OrderLine = { name: string; group?: string; qty: number; price?: number; priceNote?: string };

export type Order = {
    id: string;
    /** short code the customer and the establishment can quote, e.g. #A1B2C3 */
    code: string;
    memberId: string;
    customerName: string;
    tier: "premium" | "free";
    kind: OrderKind;
    collection: string;
    slug: string;
    place: string;
    lines: OrderLine[];
    total?: number;
    currency: string;
    mode?: OrderMode;
    address?: string;
    /** lodging: check-in / car: pick-up (YYYY-MM-DD) */
    from?: string;
    to?: string;
    guests?: number;
    note?: string;
    phone: string;
    status: OrderStatus;
    /** true = the establishment is not Premium (no owner account): the order was sent to the phone / e-mail it registered with, with no progress tracking */
    direct?: boolean;
    /** @deprecated old orders only: the Riendzo team used to forward them */
    viaRiendzo?: boolean;
    history: { status: OrderStatus; at: string }[];
    reason?: string;
    createdAt: string;
    updatedAt: string;
};
