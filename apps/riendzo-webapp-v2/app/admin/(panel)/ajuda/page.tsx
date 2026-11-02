const TIPS = [
    ["Criar conteúdo", "Abra um menu na barra lateral e use “+ Novo”. Preencha o formulário e guarde: pode guardar como rascunho."],
    ["Publicar e ocultar", "Só os conteúdos publicados aparecem no site. Use “Ocultar” para os retirar sem os apagar."],
    ["Ordem no site", "A ordem da lista é a ordem no site. Use as setas ↑ ↓ (sem filtros ativos)."],
    ["Fotografias", "Carregue no editor ou na Biblioteca de media (JPG, PNG, WebP, GIF, AVIF até 5 MB). A primeira é a capa."],
    ["Pesquisa", "Ctrl + K na barra superior procura em todos os menus ao mesmo tempo."],
    ["Cópias de segurança", "Todo o conteúdo e as imagens ficam na pasta data/ do servidor. Faça backup regularmente."],
];

export default function HelpPage() {
    return (
        <div className="mx-auto max-w-4xl">
            <h1 className="font-baloo text-3xl font-bold">Ajuda &amp; Suporte</h1>
            <p className="mt-1 text-sm text-[#4b5568]">Guia rápido do BackOffice Riendzo.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {TIPS.map(([t, d]) => (
                    <div key={t} className="rounded-2xl border border-[#0b1220]/8 bg-white p-5 shadow-sm">
                        <h2 className="font-baloo text-lg font-medium text-[#0054b5]">{t}</h2>
                        <p className="mt-1 text-sm leading-relaxed text-[#4b5568]">{d}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
