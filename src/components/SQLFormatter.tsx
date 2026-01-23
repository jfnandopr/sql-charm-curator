import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Copy, Check, Trash2, Database, FileCode, FileCheck, Settings2, X, Globe, ExternalLink, Github, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { superCompactSQL } from '@/utils/sql-utils';
import { ModeToggle } from './ModeToggle';
import { useTheme } from './theme-provider';
// Lazy load components that are not needed for initial interaction
const LazySyntaxHighlighter = lazy(() => import('./LazySyntaxHighlighter').then(module => ({ default: module.LazySyntaxHighlighter })));
const FormatterGuide = lazy(() => import('./FormatterGuide').then(module => ({ default: module.FormatterGuide })));
const FormatterFAQ = lazy(() => import('./FormatterFAQ').then(module => ({ default: module.FormatterFAQ })));
const SQLInfo = lazy(() => import('./SQLInfo').then(module => ({ default: module.SQLInfo })));
const FormatterSidebar = lazy(() => import('./FormatterSidebar').then(module => ({ default: module.FormatterSidebar })));

export type Dialect = 'postgresql' | 'mysql' | 'plsql' | 'transactsql' | 'sql' | 'bigquery';
type KeywordCase = 'preserve' | 'upper' | 'lower';
type IdentifierCase = 'preserve' | 'upper' | 'lower';
type LogicalOperatorNewline = 'before' | 'after';
type IndentStyle = 'standard' | 'tabularLeft' | 'tabularRight';

export interface FormatterOptions {
  dialect: Dialect;
  keywordCase: KeywordCase;
  dataTypeCase: KeywordCase;
  functionCase: KeywordCase;
  identifierCase: IdentifierCase;
  indentStyle: IndentStyle;
  logicalOperatorNewline: LogicalOperatorNewline;
  tabWidth: number;
  useTabs: boolean;
  expressionWidth: number;
  linesBetweenQueries: number;
  denseOperators: boolean;
  newlineBeforeSemicolon: boolean;
}

export const dialectLabels: Record<Dialect, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  plsql: 'Oracle (PL/SQL)',
  transactsql: 'SQL Server (T-SQL)',
  sql: 'Standard SQL',
  bigquery: 'BigQuery',
};

export const dialectIcons: Record<Dialect, string> = {
  postgresql: '🐘',
  mysql: '🐬',
  plsql: '🔴',
  transactsql: '🔷',
  sql: '📋',
  bigquery: '🔍',
};

const sampleQueries: Record<Dialect, string> = {
  postgresql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= NOW() - INTERVAL '30 days' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC NULLS LAST LIMIT 10;`,
  mysql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`,
  plsql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= SYSDATE - 30 AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC NULLS LAST FETCH FIRST 10 ROWS ONLY;`,
  transactsql: `SELECT TOP 10 u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATEADD(day, -30, GETDATE()) AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC;`,
  sql: `SELECT u.id, u.name, SUM(o.total) FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.name ORDER BY SUM(o.total) DESC;`,
  bigquery: `SELECT u.id, u.name, COUNT(o.id) as order_count FROM \`project.dataset.users\` u LEFT JOIN \`project.dataset.orders\` o ON u.id = o.user_id WHERE u.created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY) GROUP BY u.id, u.name ORDER BY order_count DESC LIMIT 10;`,
};

export function SQLFormatter() {
  const { t, i18n } = useTranslation();
  const [inputSQL, setInputSQL] = useState('');
  const [outputSQL, setOutputSQL] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const { theme } = useTheme();

  const [options, setOptions] = useState<FormatterOptions>({
    dialect: 'postgresql',
    keywordCase: 'upper',
    dataTypeCase: 'upper',
    functionCase: 'upper',
    identifierCase: 'preserve',
    indentStyle: 'standard',
    logicalOperatorNewline: 'before',
    tabWidth: 2,
    useTabs: false,
    expressionWidth: 120,
    linesBetweenQueries: 2,
    denseOperators: false,
    newlineBeforeSemicolon: false,
  });

  useEffect(() => {
    document.title = t('seoTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('seoDescription'));
    }
  }, [t]);

  const formatSQL = useCallback(async () => {
    if (!inputSQL.trim()) {
      setOutputSQL('');
      return;
    }

    // Configuração de parâmetros específicos por dialeto
    const getParamTypes = (dialect: Dialect) => {
      switch (dialect) {
        case 'postgresql':
          return { named: [':' as const], positional: true, numbered: ['$' as const] };
        case 'plsql':
          return { named: [':' as const], positional: false };
        case 'mysql':
          return { positional: true };
        case 'transactsql':
          return { positional: false };
        case 'bigquery':
          return { positional: true };
        default:
          return {};
      }
    };

    try {
      const { format } = await import('sql-formatter');
      const formatted = format(inputSQL, {
        language: options.dialect,
        keywordCase: options.keywordCase,
        dataTypeCase: options.dataTypeCase,
        functionCase: options.functionCase,
        identifierCase: options.identifierCase,
        indentStyle: options.indentStyle,
        logicalOperatorNewline: options.logicalOperatorNewline,
        tabWidth: options.tabWidth,
        useTabs: options.useTabs,
        expressionWidth: options.expressionWidth,
        linesBetweenQueries: options.linesBetweenQueries,
        denseOperators: options.denseOperators,
        newlineBeforeSemicolon: options.newlineBeforeSemicolon,
        paramTypes: getParamTypes(options.dialect),
      });
      const result = compactMode ? superCompactSQL(formatted) : formatted;
      setOutputSQL(result);

    } catch (error) {
      console.error('Format error:', error);
      // Fallback: tenta formatar com configurações mínimas
      try {
        const { format } = await import('sql-formatter');
        const fallbackFormatted = format(inputSQL, {
          language: options.dialect,
          keywordCase: options.keywordCase,
          tabWidth: options.tabWidth,
          paramTypes: getParamTypes(options.dialect),
        });
        const result = compactMode ? superCompactSQL(fallbackFormatted) : fallbackFormatted;
        setOutputSQL(result);
      } catch (fallbackError) {
        console.error('Fallback format error:', fallbackError);
        // Último recurso: formatar como SQL genérico
        try {
          const { format } = await import('sql-formatter');
          const genericFormatted = format(inputSQL, {
            language: 'sql',
            keywordCase: options.keywordCase,
            tabWidth: options.tabWidth,
          });
          const result = compactMode ? superCompactSQL(genericFormatted) : genericFormatted;
          setOutputSQL(result);
          toast.warning(t('toastGeneric'));
        } catch {
          toast.error(t('toastError'));
        }
      }
    }
  }, [inputSQL, options, t]);

  // Auto-format when switching to formatted tab or when options change while on formatted tab
  useEffect(() => {
    if (activeTab === 'formatted' && inputSQL.trim()) {
      formatSQL();
    }
  }, [activeTab, options, formatSQL, inputSQL]);

  const copyToClipboard = useCallback(async () => {
    if (!outputSQL) return;

    try {
      await navigator.clipboard.writeText(outputSQL);
      setCopied(true);
      toast.success(t('toastCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [outputSQL, t]);

  const clearAll = useCallback(() => {
    setInputSQL('');
    setOutputSQL('');
  }, []);

  const loadSample = useCallback(() => {
    setInputSQL(sampleQueries[options.dialect]);
    setOutputSQL('');
  }, [options.dialect]);

  const toggleCompactMode = useCallback((enabled: boolean) => {
    setCompactMode(enabled);
    if (enabled) {
      // Modo compacto: ajusta configurações para SQL mais compacto
      setOptions(prev => ({
        ...prev,
        tabWidth: 2,
        denseOperators: true,
        linesBetweenQueries: 1,
        expressionWidth: 150,
      }));
    } else {
      // Modo normal: restaura configurações padrão
      setOptions(prev => ({
        ...prev,
        tabWidth: 2,
        denseOperators: false,
        linesBetweenQueries: 2,
        expressionWidth: 120,
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in will-change-opacity">
          <div className="flex justify-end mb-4 gap-2">
            <ModeToggle />
            <div className="flex items-center gap-2 bg-secondary/50 px-3 h-10 rounded-lg border border-border/50">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select
                value={i18n.language?.split('-')[0]}
                onValueChange={(value) => i18n.changeLanguage(value)}
              >
                <SelectTrigger
                  aria-label={t('selectLanguage', 'Select Language')}
                  className="h-full w-[140px] border-none bg-transparent focus:ring-0 shadow-none text-xs p-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="pt">Português (BR)</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="inline-flex items-center gap-3 mb-4">
            <Database className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              {t('title')}
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {t('subtitle')}
          </p>
        </header>

        <main id="main-content">
          <div className="flex flex-wrap justify-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Main Controls row */}
            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
              <Select
                value={options.dialect}
                onValueChange={(value: Dialect) => setOptions(prev => ({ ...prev, dialect: value }))}
              >
                <SelectTrigger
                  aria-label={t('selectDialect')}
                  className="h-9 w-[180px] border-none bg-transparent focus:ring-0 shadow-none"
                >
                  <SelectValue placeholder={t('selectDialect')} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dialectLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{dialectIcons[key as Dialect]}</span>
                        <span>{label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
              <Select
                value={options.keywordCase}
                onValueChange={(value: KeywordCase) => setOptions(prev => ({ ...prev, keywordCase: value }))}
              >
                <SelectTrigger
                  aria-label={t('casing')}
                  className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none"
                >
                  <SelectValue placeholder={t('casing')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upper">{t('uppercase')}</SelectItem>
                  <SelectItem value="lower">{t('lowercase')}</SelectItem>
                  <SelectItem value="preserve">{t('preserve')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
              <Select
                value={options.indentStyle}
                onValueChange={(value: IndentStyle) => setOptions(prev => ({ ...prev, indentStyle: value }))}
              >
                <SelectTrigger
                  aria-label={t('indentation')}
                  className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none"
                >
                  <SelectValue placeholder={t('indentation')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">{t('indentation')}</SelectItem>
                  <SelectItem value="tabularLeft">Tabular Left</SelectItem>
                  <SelectItem value="tabularRight">Tabular Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 h-[50px]">
              <div className="flex items-center gap-2">
                <Label htmlFor="compact-mode" className="text-sm cursor-pointer whitespace-nowrap">{t('compactMode')}</Label>
                <Switch
                  id="compact-mode"
                  checked={compactMode}
                  onCheckedChange={toggleCompactMode}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-8">
            <Button
              variant="outline"
              onClick={loadSample}
              className="gap-2 border-primary/20 hover:bg-primary/10"
            >
              <Database className="w-4 h-4" />
              {t('loadExample')}
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              className="gap-2 border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            >
              <Trash2 className="w-4 h-4" />
              {t('clear')}
            </Button>

            <Button
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/10"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Settings2 className="w-4 h-4" />
              {t('advanced')}
            </Button>

            <Suspense fallback={null}>
              <FormatterSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                options={options}
                setOptions={setOptions}
              />
            </Suspense>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-secondary/20 rounded-xl mb-16" />}>
            <FormatterGuide />
          </Suspense>

          {/* Main Formatter area with layout isolation */}
          <div className="glass-card p-5 animate-slide-up transition-opacity duration-300 opacity-100 mb-12 will-change-transform contain-layout" style={{ animationDelay: '0.1s' }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full contain-paint">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="original" className="flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  <h2 className="text-sm font-medium">{t('originalSql')}</h2>
                </TabsTrigger>
                <TabsTrigger value="formatted" className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4" />
                  <h2 className="text-sm font-medium">{t('formattedSql')}</h2>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="mt-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {inputSQL.length} {t('characters')}
                  </span>
                </div>
                <Textarea
                  value={inputSQL}
                  onChange={(e) => setInputSQL(e.target.value)}
                  placeholder={t('pastePlaceholder')}
                  className="min-h-[450px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50"
                  aria-label={t('originalSql')}
                />
              </TabsContent>

              <TabsContent value="formatted" className="mt-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {outputSQL.length} {t('characters')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!outputSQL}
                    className="hover:bg-primary/20 hover:text-primary disabled:opacity-50"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {copied ? t('copied') : t('copy')}
                  </Button>
                </div>

                {/* Formatted Output */}
                <div className="min-h-[450px] code-editor overflow-hidden rounded-md border border-input bg-muted/30 contain-content">
                  {outputSQL ? (
                    <Suspense fallback={
                      <div className="p-6 font-mono text-sm bg-secondary/50 rounded-lg border border-border/50 min-h-[450px] flex items-center justify-center animate-pulse">
                        <div className="text-muted-foreground">{t('formatting', 'Beautifying...')}</div>
                      </div>
                    }>
                      <LazySyntaxHighlighter code={outputSQL} theme={theme === 'dark' ? 'dark' : 'light'} />
                    </Suspense>
                  ) : (
                    <div className="p-6 text-muted-foreground italic min-h-[450px]">
                      {inputSQL.trim() ? t('formatting') : t('emptyPlaceholder')}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <Suspense fallback={<div className="h-64 animate-pulse bg-secondary/20 rounded-xl mb-12" />}>
            <SQLInfo />
          </Suspense>

          <Suspense fallback={<div className="h-64 animate-pulse bg-secondary/20 rounded-xl mb-16" />}>
            <FormatterFAQ />
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border/50 text-muted-foreground">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Coluna 1: Sobre o SQL Formatter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground">SQL Formatter</span>
              </div>
              <p className="text-sm">
                {t('seoDescription')}
              </p>
            </div>

            {/* Coluna 2: Documentação dos Bancos de Dados */}
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t('databaseDocs')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://www.postgresql.org/docs/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t('postgresqlDocs')}
                  </a>
                </li>
                <li>
                  <a href="https://dev.mysql.com/doc/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t('mysqlDocs')}
                  </a>
                </li>
                <li>
                  <a href="https://docs.oracle.com/en/database/" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t('oracleDocs')}
                  </a>
                </li>
                <li>
                  <a href="https://cloud.google.com/bigquery/docs" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {t('bigqueryDocs')}
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Links Úteis */}
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://github.com/jfnandopr/sql-charm-curator" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    {t('sourceCode')}
                  </a>
                </li>
                <li>
                  <a href="https://jfmaia.site" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {t('developer')}
                  </a>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('terms')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('contact')}
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-primary flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {t('privacy')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-xs pb-8">
            <p>© {new Date().getFullYear()} SQL Formatter. Made with ❤️ for developers.</p>
          </div>
        </footer >
      </div >
    </div >
  );
}
