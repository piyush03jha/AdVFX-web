import { ModelConverter } from './model-converter';

export class StlConverter implements ModelConverter {
  readonly format = 'STL';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('STL conversion is not configured yet.');
  }
}
