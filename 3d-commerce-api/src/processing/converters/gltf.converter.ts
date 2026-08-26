import { ModelConverter } from './model-converter';

export class GltfConverter implements ModelConverter {
  readonly format = 'GLTF';

  async convert(_inputKey: string, _outputKey: string): Promise<void> {
    throw new Error('glTF optimization is not configured yet.');
  }
}
