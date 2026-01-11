// Pós-processamento para compactar parênteses
export const compactParenthesesFormat = (sql: string): string => {
  let result = sql.replace(/\(\s*\n\s*/g, '(');
  result = result.replace(/\s*\n\s*\)/g, ')');
  return result;
};

export const compactWhereClauses = (sql: string): string => {
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
