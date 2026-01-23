import { useTranslation } from 'react-i18next';

export function FormatterFAQ() {
    const { t } = useTranslation();

    return (
        <section className="mb-16 animate-fade-in will-change-opacity" style={{ animationDelay: '0.35s' }}>
            <h2 className="text-3xl font-bold mb-8 text-center">{t('faqTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto contain-layout">
                <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                    <h3 className="font-bold mb-2 text-lg">{t('faq1Question')}</h3>
                    <p className="text-muted-foreground">{t('faq1Answer')}</p>
                </div>
                <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                    <h3 className="font-bold mb-2 text-lg">{t('faq2Question')}</h3>
                    <p className="text-muted-foreground">{t('faq2Answer')}</p>
                </div>
                <div className="bg-secondary/20 p-6 rounded-xl border border-border/50">
                    <h3 className="font-bold mb-2 text-lg">{t('faq3Question')}</h3>
                    <p className="text-muted-foreground">{t('faq3Answer')}</p>
                </div>
            </div>
        </section>
    );
}
