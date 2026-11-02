import { getTranslations } from 'next-intl/server';
import { publicUrlOf } from '@/lib/cms/collections';
import { getHomeFlagged } from '@/lib/cms/home';
import BriefHistoryView, { type HistoryEntry } from './breaf-history';

/** Breve História: every history entry with "Mostrar na Home" on, in the BackOffice order. */
export default async function BriefHistory() {
    const groups = await getHomeFlagged(['history']);
    const entries: HistoryEntry[] = groups.flatMap(({ collection, items }) =>
        items.map((i) => ({
            year: i.tag,
            title: i.title,
            href: publicUrlOf(collection.id, i.slug),
            description: i.summary,
            noteTitle: i.tipLabel || undefined,
            note: i.tip || undefined,
            tags: i.categories.slice(0, 3),
            image: i.images?.[0],
        })),
    );
    if (entries.length === 0) return null;

    const t = await getTranslations('Home.history');
    return <BriefHistoryView entries={entries} title={t('title')} subtitle={t('subtitle', { count: entries.length })} readMore={t('readMore')} />;
}
