import { CanvasTexture, EquirectangularReflectionMapping, ImageBitmapLoader, RepeatWrapping } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader'

const assets = new Map()

const gltfObjLoader = new GLTFLoader()

const imageLoader = function ({ id, src }) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => {
      assets.set(id, { result: img })
      resolve()
    })
    img.addEventListener('error', () => {
      reject(new Error(`asset failed: ${id}`))
    })
    img.src = src
  })
}

const gltfLoader = ({ id, src }) => {
  return new Promise((resolve, reject) => {
    gltfObjLoader.load(
      src,
      (gltf) => {
        if (gltf) {
          assets.set(id, { result: gltf })
          resolve()
        } else {
          reject(new Error(`asset failed: ${id}`))
        }
      },
      () => {
        // progress
      },
      () => {
        reject(new Error(`asset failed: ${id}`))
      }
    )
  })
}

const textureLoader = function ({ id, src, tile = false }) {
  return new Promise((resolve, reject) => {
    const loader = new ImageBitmapLoader()
    loader.setOptions({ imageOrientation: 'flipY' })
    loader.load(
      src,
      (image) => {
        const texture = new CanvasTexture(image)
        if (tile) {
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
          texture.repeat.set(1, 1)
        }
        assets.set(id, { result: texture })
        resolve()
      },
      undefined,
      () => {
        reject(new Error(`asset failed: ${id}`))
      }
    )
  })
}

const hdrLoader = function ({ id, src }) {
  return new Promise((resolve, reject) => {
    const loader = new RGBELoader()
    loader.load(
      src,
      (texture) => {
        const map = texture
        map.mapping = EquirectangularReflectionMapping

        assets.set(id, { result: map })
        texture.dispose()
        resolve()
      },
      undefined,
      () => {
        reject(new Error(`asset failed: ${id}`))
      }
    )
  })
}

const globalLoader = (obj) => {
  switch (obj.type) {
    case 'image':
      return imageLoader(obj)
    case 'gltf':
      return gltfLoader(obj)
    case 'texture':
      return textureLoader(obj)
    case 'hdr':
      return hdrLoader(obj)
  }
}

export const loadManifest = function (arrayIn, onProgress = null) {
  const leanArray = Array.from(arrayIn, (item) => {
    return { id: item[0], ...item[1] }
  })
  const array = leanArray.filter((item) => {
    return !getAsset(item.id)
  })
  const numItems = array.length
  let numLoaded = 0
  const failed = []

  return new Promise((resolve, reject) => {
    const ready = function () {
      const itemsProgressed = numLoaded + failed.length
      if (itemsProgressed === numItems) {
        if (failed.length) {
          reject(failed)
        } else {
          resolve()
        }
      }

      if (onProgress) {
        const progress = itemsProgressed / numItems
        onProgress(progress)
      }
    }

    if (numItems <= 0) {
      console.log('all assets already loaded')
      onProgress(1)
      resolve()
    }

    for (let i = 0, len = numItems; i < len; i++) {
      globalLoader(array[i])
        // eslint-disable-next-line promise/always-return
        .then(() => {
          numLoaded++
          ready()
        })
        .catch((err) => {
          failed.push(err)
          ready()
        })
    }
  })
}

export const loadFile = function (obj) {
  return globalLoader(obj)
}

export const getAsset = function (id) {
  if (assets.get(id) && assets.get(id).result) {
    return assets.get(id).result
  }
  return null
}
