import { useTranslation } from 'react-i18next';

export function FormatterGuide() {
    const { t } = useTranslation();

    return (
        <section className="mb-16 animate-fade-in will-change-opacity" style={{ animationDelay: '0.15s' }}>
            <div className="glass-card p-8 md:p-12 bg-primary/5 border-primary/10 contain-layout">
                <h2 className="text-3xl font-bold mb-6 text-gradient">{t('detailedGuideTitle')}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {t('detailedGuideIntro')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">1</span>
                            {t('sqlTip1Title')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{t('sqlTip1Desc')}</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">2</span>
                            {t('sqlTip2Title')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{t('sqlTip2Desc')}</p>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm">3</span>
                            {t('sqlTip3Title')}
                        </h3>
                        <p className="text-sm text-muted-foreground">{t('sqlTip3Desc')}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
