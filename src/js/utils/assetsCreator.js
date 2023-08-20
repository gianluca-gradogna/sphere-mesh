const idRegex = process.env.NODE_ENV === 'production' ? /(?:\/)[\w-]+(?=-\w+)/ : /(?:\/)[^/]+(?=\.)/

export function createManifestAssets ({ obj, prefix, type }) {
  const manifest = new Map()

  for (const path in obj) {
    const objEl = obj[path]
    const elName = objEl.match(idRegex)[0].replace('/', '')
    const id = `${prefix}${prefix && '-'}${elName}`
    const data = {
      src: objEl,
      type,
      ...(type === 'texture' && { tile: objEl.includes('tiled') })
    }

    if (manifest.has(id)) {
        console.log(new Error(`duplicate unneeded file with id: ${id}`))
        continue
    } else {
      manifest.set(id, data)
    }
  }

  return manifest
}
