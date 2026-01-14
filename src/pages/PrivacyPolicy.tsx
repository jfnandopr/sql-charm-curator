import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-background">
            {/* Background gradient effect */}
            <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

            <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <header className="mb-8 animate-fade-in">
                    <Link to="/">
                        <Button variant="ghost" className="mb-6 gap-2 hover:bg-primary/10">
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToHome')}
                        </Button>
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-10 h-10 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                            {t('privacyPolicyTitle')}
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {t('privacyPolicyLastUpdated')}: {new Date().toLocaleDateString()}
                    </p>
                </header>

                {/* Content */}
                <div className="glass-card p-8 animate-slide-up space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyIntroTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyIntroContent')}
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyDataCollectionTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('privacyDataCollectionContent')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>{t('privacyDataCollectionItem1')}</li>
                            <li>{t('privacyDataCollectionItem2')}</li>
                            <li>{t('privacyDataCollectionItem3')}</li>
                        </ul>
                    </section>

                    {/* How We Use Your Data */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyDataUseTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('privacyDataUseContent')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>{t('privacyDataUseItem1')}</li>
                            <li>{t('privacyDataUseItem2')}</li>
                            <li>{t('privacyDataUseItem3')}</li>
                        </ul>
                    </section>

                    {/* Data Processing */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyDataProcessingTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyDataProcessingContent')}
                        </p>
                    </section>

                    {/* Third-Party Services */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyThirdPartyTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('privacyThirdPartyContent')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>
                                <strong>Google Analytics:</strong> {t('privacyThirdPartyGA')}
                            </li>
                            <li>
                                <strong>Google AdSense:</strong> {t('privacyThirdPartyAdsense')}
                            </li>
                        </ul>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyCookiesTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyCookiesContent')}
                        </p>
                    </section>

                    {/* Your Rights */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyRightsTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            {t('privacyRightsContent')}
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                            <li>{t('privacyRightsItem1')}</li>
                            <li>{t('privacyRightsItem2')}</li>
                            <li>{t('privacyRightsItem3')}</li>
                            <li>{t('privacyRightsItem4')}</li>
                        </ul>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacySecurityTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacySecurityContent')}
                        </p>
                    </section>

                    {/* Changes to Policy */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyChangesTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyChangesContent')}
                        </p>
                    </section>

                    {/* Contact */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4">{t('privacyContactTitle')}</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            {t('privacyContactContent')}
                        </p>
                    </section>
                </div>

                {/* Back to Home Button */}
                <div className="mt-8 text-center">
                    <Link to="/">
                        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/10">
                            <ArrowLeft className="w-4 h-4" />
                            {t('backToHome')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
