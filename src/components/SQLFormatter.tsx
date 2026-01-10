import { useState, useCallback, useEffect } from 'react';
import { format } from 'sql-formatter';
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
import { Input } from '@/components/ui/input';
import { Copy, Check, Trash2, Database, FileCode, FileCheck, Settings2, X, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslation } from 'react-i18next';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Dialect = 'postgresql' | 'mysql' | 'plsql' | 'transactsql' | 'sql' | 'bigquery';
type KeywordCase = 'preserve' | 'upper' | 'lower';
type IdentifierCase = 'preserve' | 'upper' | 'lower';
type LogicalOperatorNewline = 'before' | 'after';
type IndentStyle = 'standard' | 'tabularLeft' | 'tabularRight';

interface FormatterOptions {
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
  compactParentheses: boolean;
  denseOperators: boolean;
  newlineBeforeSemicolon: boolean;
}

// Pós-processamento para compactar parênteses
const compactParenthesesFormat = (sql: string): string => {
  let result = sql.replace(/\(\s*\n\s+/g, '(');
  result = result.replace(/\n\s+\)/g, ')');
  return result;
};

const compactWhereClauses = (sql: string): string => {
  const clausePattern = /\b(WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION|EXCEPT|INTERSECT|FROM|SELECT|UPDATE|INSERT|DELETE|WITH|VALUES|SET|RETURNING)\b/gi;
  const parts = sql.split(clausePattern);
  let result = parts[0];

  for (let i = 1; i < parts.length; i += 2) {
    const keyword = parts[i];
    const content = parts[i + 1] || '';

    if (keyword.toUpperCase() === 'WHERE') {
      result += keyword + compactParenthesesFormat(content);
    } else {
      result += keyword + content;
    }
  }

  return result;
};

const dialectLabels: Record<Dialect, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  plsql: 'Oracle (PL/SQL)',
  transactsql: 'SQL Server (T-SQL)',
  sql: 'Standard SQL',
  bigquery: 'BigQuery',
};

const dialectIcons: Record<Dialect, string> = {
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
    expressionWidth: 60,
    linesBetweenQueries: 2,
    compactParentheses: true,
    denseOperators: false,
    newlineBeforeSemicolon: false,
  });

  const formatSQL = useCallback(() => {
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
      const result = options.compactParentheses ? compactWhereClauses(formatted) : formatted;
      setOutputSQL(result);
    } catch (error) {
      console.error('Format error:', error);
      // Fallback: tenta formatar com configurações mínimas
      try {
        const fallbackFormatted = format(inputSQL, {
          language: options.dialect,
          keywordCase: options.keywordCase,
          tabWidth: options.tabWidth,
          paramTypes: getParamTypes(options.dialect),
        });
        const result = options.compactParentheses ? compactWhereClauses(fallbackFormatted) : fallbackFormatted;
        setOutputSQL(result);
      } catch (fallbackError) {
        console.error('Fallback format error:', fallbackError);
        // Último recurso: formatar como SQL genérico
        try {
          const genericFormatted = format(inputSQL, {
            language: 'sql',
            keywordCase: options.keywordCase,
            tabWidth: options.tabWidth,
          });
          const result = options.compactParentheses ? compactWhereClauses(genericFormatted) : genericFormatted;
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
  }, [activeTab, options, formatSQL]);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effect */}
      <div className="fixed inset-0 pointer-events-none" style={{ background: 'var(--gradient-glow)' }} />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in">
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <Select
                value={i18n.language}
                onValueChange={(value) => i18n.changeLanguage(value)}
              >
                <SelectTrigger className="h-8 w-[140px] border-none bg-transparent focus:ring-0 shadow-none text-xs">
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

          <div className="flex flex-wrap justify-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {/* Main Controls row */}
            <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-lg border border-border/50">
              <Select
                value={options.dialect}
                onValueChange={(value: Dialect) => setOptions(prev => ({ ...prev, dialect: value }))}
              >
                <SelectTrigger className="h-9 w-[180px] border-none bg-transparent focus:ring-0 shadow-none">
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
                <SelectTrigger className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none">
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
                <SelectTrigger className="h-9 w-[140px] border-none bg-transparent focus:ring-0 shadow-none">
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
                <Label htmlFor="compact-parentheses-main" className="text-sm cursor-pointer whitespace-nowrap">{t('compactParentheses')}</Label>
                <Switch
                  id="compact-parentheses-main"
                  checked={options.compactParentheses}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, compactParentheses: checked }))}
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

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-transparent z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Custom Aside Sidebar */}
            <aside
              className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background border-l border-border z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-xl font-bold text-gradient">{t('advancedOptions')}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="hover:bg-secondary rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">

                  <Accordion type="single" collapsible defaultValue="general" className="w-full">
                    {/* Section 1: General Options (Reduced) */}
                    <AccordionItem value="general">
                      <AccordionTrigger>{t('general')}</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{t('logicalOperatorNewline')}</Label>
                          <Select
                            value={options.logicalOperatorNewline}
                            onValueChange={(value: LogicalOperatorNewline) => setOptions(prev => ({ ...prev, logicalOperatorNewline: value }))}
                          >
                            <SelectTrigger className="h-8 text-sm bg-secondary border-border">
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

                    {/* Section 2: Casing (Reduced) */}
                    <AccordionItem value="casing">
                      <AccordionTrigger>{t('otherCasing')}</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{t('dataTypes')}</Label>
                          <Select
                            value={options.dataTypeCase}
                            onValueChange={(value: KeywordCase) => setOptions(prev => ({ ...prev, dataTypeCase: value }))}
                          >
                            <SelectTrigger className="h-8 text-sm bg-secondary border-border">
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
                            onValueChange={(value: KeywordCase) => setOptions(prev => ({ ...prev, functionCase: value }))}
                          >
                            <SelectTrigger className="h-8 text-sm bg-secondary border-border">
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
                            onValueChange={(value: IdentifierCase) => setOptions(prev => ({ ...prev, identifierCase: value }))}
                          >
                            <SelectTrigger className="h-8 text-sm bg-secondary border-border">
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

                    {/* Section 3: Indentation & Spacing (Reduced) */}
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
                              onChange={(e) => setOptions(prev => ({ ...prev, tabWidth: parseInt(e.target.value) || 2 }))}
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
                              onChange={(e) => setOptions(prev => ({ ...prev, linesBetweenQueries: parseInt(e.target.value) || 2 }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">{t('expressionWidth')}</Label>
                          <Select
                            value={String(options.expressionWidth)}
                            onValueChange={(value) => setOptions(prev => ({ ...prev, expressionWidth: Number(value) }))}
                          >
                            <SelectTrigger className="h-8 text-sm bg-secondary border-border">
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

                    {/* Section 4: Flags (Reduced) */}
                    <AccordionItem value="advanced">
                      <AccordionTrigger>{t('others')}</AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-2">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="use-tabs" className="text-xs cursor-pointer">{t('useTabs')}</Label>
                            <Switch
                              id="use-tabs"
                              checked={options.useTabs}
                              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, useTabs: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="dense-operators" className="text-xs cursor-pointer">{t('denseOperators')}</Label>
                            <Switch
                              id="dense-operators"
                              checked={options.denseOperators}
                              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, denseOperators: checked }))}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="newline-semicolon" className="text-xs cursor-pointer">{t('newlineBeforeSemicolon')}</Label>
                            <Switch
                              id="newline-semicolon"
                              checked={options.newlineBeforeSemicolon}
                              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, newlineBeforeSemicolon: checked }))}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </aside>
          </div>
        </header>

        {/* Main Content with Tabs */}
        <div className="glass-card p-5 animate-slide-up transition-opacity duration-300 opacity-100" style={{ animationDelay: '0.1s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="original" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                {t('originalSql')}
              </TabsTrigger>
              <TabsTrigger value="formatted" className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                {t('formattedSql')}
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
              <div className="min-h-[450px] code-editor overflow-hidden rounded-md border border-input bg-muted/30">
                {outputSQL ? (
                  <SyntaxHighlighter
                    language="sql"
                    style={vs}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      background: '#fff',
                      fontSize: '1.2em',
                      lineHeight: '1.5',
                      minHeight: '450px',
                      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
                    }}
                    wrapLines={true}
                    wrapLongLines={true}
                  >
                    {outputSQL}
                  </SyntaxHighlighter>
                ) : (
                  <div className="p-6 text-muted-foreground italic min-h-[450px]">
                    {inputSQL.trim() ? t('formatting') : t('emptyPlaceholder')}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>
            {t('support')}{' '}
            {Object.entries(dialectLabels).map(([key, label], index, arr) => (
              <span key={key}>
                <span className="text-foreground">{dialectIcons[key as Dialect]} {label}</span>
                {index < arr.length - 1 && ' • '}
              </span>
            ))}
          </p>
        </footer>
      </div>
    </div>
  );
}
