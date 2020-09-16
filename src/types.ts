export type ValueOf<T> = T[keyof T];

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
