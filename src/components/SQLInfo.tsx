import { useTranslation } from 'react-i18next';
import { dialectIcons, dialectLabels, Dialect } from './SQLFormatter';

export const SQLInfo = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-12">
            {/* SEO Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <section>
                    <h2 className="text-2xl font-bold mb-4">{t('whyFormatTitle')}</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {t('whyFormatDescription')}
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">{t('featuresTitle')}</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature1Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature1Desc')}</p>
                        </li>
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature2Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature2Desc')}</p>
                        </li>
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature3Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature3Desc')}</p>
                        </li>
                        <li className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                            <h3 className="font-semibold mb-1">{t('feature4Title')}</h3>
                            <p className="text-xs text-muted-foreground">{t('feature4Desc')}</p>
                        </li>
                    </ul>
                </section>
            </div>

            <section className="mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('supportedDialects')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(dialectLabels).map(([key, label]) => (
                        <div key={key} className="flex flex-col items-center p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                            <span className="text-3xl mb-2">{dialectIcons[key as Dialect]}</span>
                            <span className="font-medium text-sm">{label}</span>
                            <p className="text-[10px] text-center text-muted-foreground mt-2">
                                {t(`${key}Desc`)}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-3xl mx-auto mb-16 p-8 rounded-2xl bg-primary/5 border border-primary/10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold mb-6 text-center">{t('howToUseTitle')}</h2>
                <div className="space-y-4 text-muted-foreground">
                    <p>{t('howToUseStep1')}</p>
                    <p>{t('howToUseStep2')}</p>
                    <p>{t('howToUseStep3')}</p>
                    <p>{t('howToUseStep4')}</p>
                </div>
            </section>
        </div>
    );
};
