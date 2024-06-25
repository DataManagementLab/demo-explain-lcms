type PartialRecord<K extends string, T> = {
  [P in K]?: T;
};

export default PartialRecord;
