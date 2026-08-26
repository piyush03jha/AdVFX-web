import { ModelConverter } from './model-converter';

export class UsdConverter implements ModelConverter {
  readonly format = 'USD';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('USD conversion is not configured yet.');
  }
}
