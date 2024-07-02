interface RecordItem<T1 extends string | number, T2> {
  key: T1;
  value: T2;
}

function recordToList<T1 extends string, T2>(record: Record<T1, T2>) {
  const res: RecordItem<T1, T2>[] = [];
  for (const key in record) {
    res.push({ key: key, value: record[key] });
  }
  return res;
}

export default recordToList;
