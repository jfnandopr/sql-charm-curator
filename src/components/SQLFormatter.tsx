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
import { Copy, Check, Trash2, Database, FileCode, FileCheck } from 'lucide-react';
import { toast } from 'sonner';

type Dialect = 'postgresql' | 'mysql' | 'plsql' | 'transactsql';
type KeywordCase = 'preserve' | 'upper' | 'lower';

interface FormatterOptions {
  dialect: Dialect;
  keywordCase: KeywordCase;
  indentStyle: 'standard' | 'tabularLeft' | 'tabularRight';
  tabWidth: number;
}

const dialectLabels: Record<Dialect, string> = {
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  plsql: 'Oracle (PL/SQL)',
  transactsql: 'SQL Server (T-SQL)',
};

const dialectIcons: Record<Dialect, string> = {
  postgresql: '🐘',
  mysql: '🐬',
  plsql: '🔴',
  transactsql: '🔷',
};

const sampleQueries: Record<Dialect, string> = {
  postgresql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= NOW() - INTERVAL '30 days' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC NULLS LAST LIMIT 10;`,
  mysql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`,
  plsql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= SYSDATE - 30 AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC NULLS LAST FETCH FIRST 10 ROWS ONLY;`,
  transactsql: `SELECT TOP 10 u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= DATEADD(day, -30, GETDATE()) AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC;`,
};

export function SQLFormatter() {
  const [inputSQL, setInputSQL] = useState('');
  const [outputSQL, setOutputSQL] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [options, setOptions] = useState<FormatterOptions>({
    dialect: 'postgresql',
    keywordCase: 'upper',
    indentStyle: 'standard',
    tabWidth: 2,
  });

  const formatSQL = useCallback(() => {
    if (!inputSQL.trim()) {
      setOutputSQL('');
      return;
    }

    try {
      const formatted = format(inputSQL, {
        language: options.dialect,
        keywordCase: options.keywordCase,
        indentStyle: options.indentStyle,
        tabWidth: options.tabWidth,
        linesBetweenQueries: 2,
      });
      setOutputSQL(formatted);
    } catch (error) {
      console.error('Format error:', error);
      toast.error('Erro ao formatar SQL. Verifique a sintaxe.');
    }
  }, [inputSQL, options]);

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
      toast.success('Copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  }, [outputSQL]);

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
          <div className="inline-flex items-center gap-3 mb-4">
            <Database className="w-10 h-10 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              SQL Formatter
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Formate suas consultas SQL de forma elegante. Suporte para PostgreSQL, MySQL, Oracle e SQL Server.
          </p>
        </header>

        {/* Action Buttons */}
        <div className="glass-card p-4 mb-6 animate-slide-up">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Dialeto:</span>
              <Select
                value={options.dialect}
                onValueChange={(value: Dialect) => setOptions(prev => ({ ...prev, dialect: value }))}
              >
                <SelectTrigger className="w-48 bg-secondary border-border">
                  <SelectValue />
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
            
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSample}
                className="border-border hover:bg-secondary"
              >
                Carregar Exemplo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="border-border hover:bg-destructive/20 hover:text-destructive hover:border-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <div className="glass-card p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="original" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                SQL Original
              </TabsTrigger>
              <TabsTrigger value="formatted" className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                SQL Formatado
              </TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="mt-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">
                  {inputSQL.length} caracteres
                </span>
              </div>
              <Textarea
                value={inputSQL}
                onChange={(e) => setInputSQL(e.target.value)}
                placeholder="Cole sua consulta SQL aqui..."
                className="min-h-[450px] font-mono text-sm bg-secondary/50 border-border resize-none scrollbar-thin focus:ring-2 focus:ring-primary/50"
              />
            </TabsContent>

            <TabsContent value="formatted" className="mt-0">
              {/* Formatting Options */}
              <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Keywords:</span>
                  <Select
                    value={options.keywordCase}
                    onValueChange={(value: KeywordCase) => setOptions(prev => ({ ...prev, keywordCase: value }))}
                  >
                    <SelectTrigger className="w-36 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upper">MAIÚSCULAS</SelectItem>
                      <SelectItem value="lower">minúsculas</SelectItem>
                      <SelectItem value="preserve">Preservar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Indentação:</span>
                  <Select
                    value={options.indentStyle}
                    onValueChange={(value: 'standard' | 'tabularLeft' | 'tabularRight') => 
                      setOptions(prev => ({ ...prev, indentStyle: value }))
                    }
                  >
                    <SelectTrigger className="w-36 bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Padrão</SelectItem>
                      <SelectItem value="tabularLeft">Tabular Esq.</SelectItem>
                      <SelectItem value="tabularRight">Tabular Dir.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="ml-auto">
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
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>

              {/* Formatted Output */}
              <div className="min-h-[400px] code-editor overflow-auto scrollbar-thin whitespace-pre-wrap">
                {outputSQL || (
                  <span className="text-muted-foreground italic">
                    {inputSQL.trim() ? 'Formatando...' : 'Insira uma consulta SQL na aba "SQL Original"'}
                  </span>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground text-sm">
          <p>
            Suporte para{' '}
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
