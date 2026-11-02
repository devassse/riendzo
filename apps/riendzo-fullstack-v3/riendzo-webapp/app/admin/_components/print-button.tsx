"use client";

export default function PrintButton() {
    return <button type="button" onClick={() => window.print()} className="cursor-pointer rounded-full bg-[#0054b5] px-6 py-2.5 font-baloo text-sm font-medium text-white hover:opacity-90">Imprimir</button>;
}
