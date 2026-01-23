import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { FormatterOptions } from './SQLFormatter';

interface FormatterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    options: FormatterOptions;
    setOptions: (options: FormatterOptions | ((prev: FormatterOptions) => FormatterOptions)) => void;
}

export const FormatterSidebar = ({ isOpen, onClose, options, setOptions }: FormatterSidebarProps) => {
    const { t } = useTranslation();

    return (
        <>
            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-transparent z-40"
                    onClick={onClose}
                />
            )}

            {/* Custom Aside Sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border z-50 shadow-2xl transform transition-transform duration-300 ease-in-out will-change-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-gradient">{t('advancedOptions')}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="hover:bg-secondary rounded-full"
                            aria-label={t('close', 'Close')}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <Accordion type="single" collapsible defaultValue="general" className="w-full">
                            {/* Section 1: General Options */}
                            <AccordionItem value="general">
                                <AccordionTrigger>{t('general')}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{t('logicalOperatorNewline')}</Label>
                                        <Select
                                            value={options.logicalOperatorNewline}
                                            onValueChange={(value: any) => setOptions((prev: any) => ({ ...prev, logicalOperatorNewline: value }))}
                                        >
                                            <SelectTrigger aria-label={t('logicalOperatorNewline')} className="h-8 text-sm bg-secondary border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="before">{t('before')}</SelectItem>
                                                <SelectItem value="after">{t('after')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Section 2: Casing */}
                            <AccordionItem value="casing">
                                <AccordionTrigger>{t('otherCasing')}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{t('dataTypes')}</Label>
                                        <Select
                                            value={options.dataTypeCase}
                                            onValueChange={(value: any) => setOptions((prev: any) => ({ ...prev, dataTypeCase: value }))}
                                        >
                                            <SelectTrigger aria-label={t('dataTypes')} className="h-8 text-sm bg-secondary border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="upper">{t('uppercase')}</SelectItem>
                                                <SelectItem value="lower">{t('lowercase')}</SelectItem>
                                                <SelectItem value="preserve">{t('preserve')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{t('functions')}</Label>
                                        <Select
                                            value={options.functionCase}
                                            onValueChange={(value: any) => setOptions((prev: any) => ({ ...prev, functionCase: value }))}
                                        >
                                            <SelectTrigger aria-label={t('functions')} className="h-8 text-sm bg-secondary border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="upper">{t('uppercase')}</SelectItem>
                                                <SelectItem value="lower">{t('lowercase')}</SelectItem>
                                                <SelectItem value="preserve">{t('preserve')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{t('identifiers')}</Label>
                                        <Select
                                            value={options.identifierCase}
                                            onValueChange={(value: any) => setOptions((prev: any) => ({ ...prev, identifierCase: value }))}
                                        >
                                            <SelectTrigger aria-label={t('identifiers')} className="h-8 text-sm bg-secondary border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="upper">{t('uppercase')}</SelectItem>
                                                <SelectItem value="lower">{t('lowercase')}</SelectItem>
                                                <SelectItem value="preserve">{t('preserve')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Section 3: Indentation & Spacing */}
                            <AccordionItem value="indentation">
                                <AccordionTrigger>{t('spacing')}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">{t('tabWidth')}</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={8}
                                                className="h-8 text-sm bg-secondary border-border"
                                                value={options.tabWidth}
                                                onChange={(e) => setOptions((prev: any) => ({ ...prev, tabWidth: parseInt(e.target.value) || 2 }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">{t('linesPerQuery')}</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={5}
                                                className="h-8 text-sm bg-secondary border-border"
                                                value={options.linesBetweenQueries}
                                                onChange={(e) => setOptions((prev: any) => ({ ...prev, linesBetweenQueries: parseInt(e.target.value) || 2 }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">{t('expressionWidth')}</Label>
                                        <Select
                                            value={String(options.expressionWidth)}
                                            onValueChange={(value) => setOptions((prev: any) => ({ ...prev, expressionWidth: Number(value) }))}
                                        >
                                            <SelectTrigger aria-label={t('expressionWidth')} className="h-8 text-sm bg-secondary border-border">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="40">40 {t('characters')}</SelectItem>
                                                <SelectItem value="50">50 {t('characters')}</SelectItem>
                                                <SelectItem value="60">60 {t('characters')}</SelectItem>
                                                <SelectItem value="80">80 {t('characters')}</SelectItem>
                                                <SelectItem value="100">100 {t('characters')}</SelectItem>
                                                <SelectItem value="120">120 {t('characters')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Section 4: Flags */}
                            <AccordionItem value="advanced">
                                <AccordionTrigger>{t('others')}</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-tabs" className="text-xs cursor-pointer">{t('useTabs')}</Label>
                                            <Switch
                                                id="use-tabs"
                                                checked={options.useTabs}
                                                onCheckedChange={(checked) => setOptions((prev: any) => ({ ...prev, useTabs: checked }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="dense-operators" className="text-xs cursor-pointer">{t('denseOperators')}</Label>
                                            <Switch
                                                id="dense-operators"
                                                checked={options.denseOperators}
                                                onCheckedChange={(checked) => setOptions((prev: any) => ({ ...prev, denseOperators: checked }))}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="newline-semicolon" className="text-xs cursor-pointer">{t('newlineBeforeSemicolon')}</Label>
                                            <Switch
                                                id="newline-semicolon"
                                                checked={options.newlineBeforeSemicolon}
                                                onCheckedChange={(checked) => setOptions((prev: any) => ({ ...prev, newlineBeforeSemicolon: checked }))}
                                            />
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </aside>
        </>
    );
};
