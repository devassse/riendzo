/**
 * Link between the details popup of an item (offers-view) and the order panel of the same page.
 * Plain module (not "use client") so server and client components can both import the values.
 */
/** Sent by the popup button: detail = { group, name } of the item to add / select. */
export const ORDER_ADD_EVENT = "riendzo:order-add";
/** id of the element holding the order panel (the page scrolls to it) */
export const ORDER_PANEL_ID = "fazer-pedido";
