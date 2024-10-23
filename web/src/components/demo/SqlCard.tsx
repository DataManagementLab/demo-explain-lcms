import { useGetQuery } from '@/api/queries';
import { useDemoStore } from '@/stores/demoStore';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import pgsql from 'react-syntax-highlighter/dist/esm/languages/hljs/pgsql';
import vs from 'react-syntax-highlighter/dist/esm/styles/hljs/vs';
import { format } from 'sql-formatter';
import { useShallow } from 'zustand/react/shallow';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

SyntaxHighlighter.registerLanguage('pgsql', pgsql);

export function SqlCard() {
  const queryId = useDemoStore(useShallow((state) => state.queryId));
  const query = useGetQuery({ queryId: queryId });

  return (
    query.isSuccess && (
      <Card className="border-none">
        <CardHeader>
          <CardTitle>SQL</CardTitle>
        </CardHeader>
        <CardContent>
          <SyntaxHighlighter language="pgsql" style={vs}>
            {format(query.data.sql, { language: 'postgresql' })}
          </SyntaxHighlighter>
        </CardContent>
      </Card>
    )
  );
}
