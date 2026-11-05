import { getTranslations } from 'next-intl/server';
import { publicUrlOf } from '@/lib/cms/collections';
import { getHomeFlagged } from '@/lib/cms/home';
import PublicServicesView, { type EmergencyNumber, type ServiceCategory, type ServiceRow } from './public-services';
import type { CatalogItem } from '@/app/components/sections/catalog-types';

const hoursText = (i: CatalogItem, open24: string) =>
    i.hours?.open24h ? open24 : i.hours?.note || undefined;

/**
 * Serviços Públicos and Emergências, from the BackOffice:
 * every service with "Mostrar na Home" on, grouped by menu; emergency numbers come from Serviços > Emergências.
 */
export default async function PublicServices() {
    const [t, groups] = await Promise.all([getTranslations('Home.services'), getHomeFlagged(['services'])]);

    const categories: ServiceCategory[] = [];
    let emergency: EmergencyNumber[] = [];

    for (const { collection, items } of groups) {
        if (collection.id === 'services-emergency') {
            emergency = items.filter((i) => i.contact?.phone).map((i) => ({ emoji: i.emoji, label: i.title, number: i.contact!.phone! }));
            continue;
        }
        categories.push({
            title: collection.label,
            description: collection.description,
            href: collection.publicPath,
            iconKey: collection.id,
            rows: items.map<ServiceRow>((i) => ({
                name: i.title,
                href: publicUrlOf(collection.id, i.slug),
                summary: i.summary,
                address: i.contact?.address,
                hours: hoursText(i, t('open24h')),
                phone: i.contact?.phone,
                lat: i.location?.lat,
                lng: i.location?.lng,
            })),
        });
    }

    return (
        <PublicServicesView
            categories={categories}
            emergency={emergency}
            labels={{
                eyebrow: t('eyebrow'), title: t('title'), description: t('description'), directions: t('directions'), open: t('open'),
                seeAll: t('seeAll'), exploreAll: t('exploreAll'), emergencyEyebrow: t('emergencyEyebrow'), emergencyTitle: t('emergencyTitle'),
                emergencyAll: t('emergencyAll'), emergencyNote: t('emergencyNote'), call: t('call'),
            }}
        />
    );
}
