import { useGetQuery } from '@/api/queries';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import pgsql from 'react-syntax-highlighter/dist/esm/languages/hljs/pgsql';
import vs from 'react-syntax-highlighter/dist/esm/styles/hljs/vs';
import { format } from 'sql-formatter';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

SyntaxHighlighter.registerLanguage('pgsql', pgsql);

interface Props {
  queryId: number;
}

export function SqlCard({ queryId }: Props) {
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
