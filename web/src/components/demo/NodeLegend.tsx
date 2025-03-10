const nodeTypeToColor = {
    'Physical Operator': '#F5F5F5',
    'Column Node': '#D5E8D4',
    'Logical Predicate': '#F8CECC',
    'Output Column': '#FFF2CC',
    'Table Node': '#DAE8FC',
} satisfies Record<string, string>;

const importanceToColor = Array.from({ length: 10 }, (_, i) => {
    const score = i * (1 / (10 - 1));
    const color = score < 0.33
        ? `rgb(${255}, ${255}, ${Math.round(255 - score * 255)})`
        : `rgb(${255}, ${Math.round(255 - score * 255)}, ${0})`;

    return { score: score.toFixed(1), color };
});

export function NodeTypeLegend({ drawImportance }: { drawImportance: boolean }) {
    return (
        <div className="flex flex-row mt-0 bg-muted rounded-xl border bold p-1.5">
            <div className="text-xs font-semibold">
                {drawImportance ? 'Importance Score:' : 'Node Type :'}
            </div>
            {drawImportance
                ? importanceToColor.map(({ score, color }, index) => (
                    <div key={index} className="flex items-center space-x-1 text-xs ml-3">
                        <div
                            className="w-3.5 h-3.5 rounded border border-black"
                            style={{ backgroundColor: color }}
                        ></div>
                        <span>{score}</span>
                    </div>
                ))
                : Object.entries(nodeTypeToColor).map(([nodeType, color]) => (
                    <div key={nodeType} className="flex items-center space-x-1 text-xs ml-3">
                        <div
                            className="w-3.5 h-3.5 rounded border border-black"
                            style={{ backgroundColor: color }}
                        ></div>
                        <span>{nodeType}</span>
                    </div>
                ))}
        </div>
    );
}
