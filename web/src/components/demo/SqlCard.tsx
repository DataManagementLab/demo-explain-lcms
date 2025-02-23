import { useState } from 'react';
import { useGetQuery } from '@/api/queries';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import pgsql from 'react-syntax-highlighter/dist/esm/languages/hljs/pgsql';
import vs from 'react-syntax-highlighter/dist/esm/styles/hljs/vs';
import { format } from 'sql-formatter';

import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

SyntaxHighlighter.registerLanguage('pgsql', pgsql);

interface Props {
  queryId: number;
}

export function SqlCard({ queryId }: Props) {
  const query = useGetQuery({ queryId: queryId });
  const [showContent, setShowContent] = useState(true);

  return (
    <Card>
      <CardHeader
        className={cn('flex w-full flex-row items-center justify-center py-2')}
      >
        <CardTitle>SQL</CardTitle>
        <div className="grow"></div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowContent(!showContent)}
        >
          {showContent ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>
      </CardHeader>
      {showContent && query.isSuccess && (
        <CardContent>
          <SyntaxHighlighter language="pgsql" style={vs}>
            {format(query.data.sql, { language: 'postgresql' })}
          </SyntaxHighlighter>
        </CardContent>
      )}
    </Card>
  );
}
