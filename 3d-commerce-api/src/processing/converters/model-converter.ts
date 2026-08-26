export interface ModelConverter {
  readonly format: string;

  convert(inputKey: string, outputKey: string): Promise<void>;
}
