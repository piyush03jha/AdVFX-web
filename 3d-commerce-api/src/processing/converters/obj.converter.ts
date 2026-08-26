import { ModelConverter } from './model-converter';

export class ObjConverter implements ModelConverter {
  readonly format = 'OBJ';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('OBJ conversion is not configured yet.');
  }
}
