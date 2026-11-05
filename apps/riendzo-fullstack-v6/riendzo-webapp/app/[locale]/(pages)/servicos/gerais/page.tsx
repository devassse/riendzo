import SectionPage from "@/app/components/sections/section-page";

// Content is managed in the BackOffice (/admin) › Serviços › Serviços Gerais.
export default async function Page() {
    return <SectionPage section="services" pageKey="general" />;
}
