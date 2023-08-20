import { createManifestAssets } from '../utils/assetsCreator'

const textures = import.meta.glob('../../assets/textures/*', { as: 'url', eager: true })
const hdrs = import.meta.glob('@/assets/hdr/*.hdr', { as: 'url', eager: true })
// const gltfs = import.meta.glob('@/assets/models/*.glb', { as: 'url', eager: true })

export const manifest = new Map([
  ...createManifestAssets({ obj: textures, prefix: 'tex', type: 'texture' }).entries(),
  ...createManifestAssets({ obj: hdrs, prefix: 'hdr', type: 'hdr' }).entries(),
//   ...createManifestAssets({ obj: gltfs, prefix: '', type: 'gltf' }).entries()
])
