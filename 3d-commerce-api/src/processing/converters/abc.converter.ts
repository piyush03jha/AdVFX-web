import { ModelConverter } from './model-converter';

export class AbcConverter implements ModelConverter {
  readonly format = 'ABC';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('Alembic conversion is not configured yet.');
  }
}
