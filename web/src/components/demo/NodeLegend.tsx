const nodeTypeToColor = {
  'Physical Operator': '#F5F5F5',
  'Column Node': '#D5E8D4',
  'Logical Predicate': '#F8CECC',
  'Output Column': '#FFF2CC',
  'Table Node': '#DAE8FC',
} satisfies Record<string, string>;

const importanceToColor = Array.from({ length: 10 }, (_, i) => {
  const score = i * (1 / (10 - 1));
  const color =
    score < 0.33
      ? `rgb(${255}, ${255}, ${Math.round(255 - score * 255)})`
      : `rgb(${255}, ${Math.round(255 - score * 255)}, ${0})`;

  return { score: score.toFixed(1), color };
});

export function NodeTypeLegend({
  graphViewMode,
}: {
  graphViewMode: 'nodeTypes' | 'nodeImportance' | 'actualRuntimes';
}) {
  let legendTitle: string;
  if (graphViewMode === 'nodeImportance') {
    legendTitle = 'Importance Score:';
  } else if (graphViewMode === 'actualRuntimes') {
    legendTitle = 'Relative Runtime:';
  } else {
    legendTitle = 'Node Type:';
  }

  const legendItems =
    graphViewMode === 'nodeImportance' || graphViewMode === 'actualRuntimes'
      ? importanceToColor.map(({ score, color }, index) => (
          <div key={index} className="ml-3 flex items-center space-x-1 text-xs">
            <div
              className="h-3.5 w-3.5 rounded border border-black"
              style={{ backgroundColor: color }}
            ></div>
            <span>{score}</span>
          </div>
        ))
      : Object.entries(nodeTypeToColor).map(([nodeType, color]) => (
          <div
            key={nodeType}
            className="ml-3 flex items-center space-x-1 text-xs"
          >
            <div
              className="h-3.5 w-3.5 rounded border border-black"
              style={{ backgroundColor: color }}
            ></div>
            <span>{nodeType}</span>
          </div>
        ));

  return (
    <div className="bg-muted bold mt-0 flex flex-row rounded-xl border p-1.5">
      <div className="text-xs font-semibold">{legendTitle}</div>
      {legendItems}
    </div>
  );
}
