'use strict'

// !

const getUTCDate = () => true
// const getTransformer = () => async () => true
const getFullUrl = (path) => path
const getAlternateSizeUrls = (path) => [ path, path ]
const stripHtml = (raw, param) => raw
const extractBadge = (rawLead) => ({ text: 'dummy', type: 'dummy' })

const req = async ({ url }) => ({ url })

const retrieveHttp = ({ url }) => async () => await req({ url })

function getTransformer (spec) {
  const noTransform = (raw) => raw

  return async (raw) => await Promise.all(Object.keys(spec).map(async (prop) => {
    const field = spec[prop]

    if (field === true) {
      return [ prop, raw[prop] ]
    }

    if (typeof field === 'function') {
      return [ prop, await field(raw) ]
    }

    if (typeof field === 'object') {
      const { src = prop, transform = noTransform, iterate } = field
      const sourceField = raw[src]

      if (iterate) {
        const max = field.max || sourceField.length

        return [ prop, sourceField.slice(0, max).map(transform) ]
      } else {
        return [ prop, transform(sourceField) ]
      }
    }

    throw new Error(`Invalid spec for field ${prop}`)
  }))
}

const transformChannel = getTransformer({
  'id': { src: 'path', transform: (p) => p === '/home' ? 'headlines' : p.replace(/^\/home\//, '') },
  'name': true,
  'lavel': { transform: Number }
})

const transformImage = getTransformer({
  'webUrl': { src: 'current-transformImage-path', transform: getFullUrl },
  'alternateSizeUrls': { src: 'current-transformImage-path', transform: getAlternateSizeUrls },
  'title': 'current-transformImage-title',
  'altText': 'current-transformImage-alt'
})

const transformArticle = getTransformer({
  'id': { src: 'articleId', transform: Number },
  'date': { src: 'displayDate', transform: getUTCDate },
  'author': true,
  'image': transformImage,
  'agency': 'agency2',
  'title': { src: 'titel-long', transform: (raw) => stripHtml(raw, true) },
  'badge': { src: 'lead-long', transform: extractBadge },
  'commentInfo': { src: 'flexmodulelist', transform: () => ({ nope: 'not yet' }) },
  'channels': { transform: transformChannel, iterate: true, max: 5 }
})

const defineDocument = (spec) => async (id) => ({ ...spec, id })

const getArticle = defineDocument({
  retriever: retrieveHttp({ url: 'http://diepresse.com/home/{id}/xmladv.do' }),
  transformer: transformArticle
})

;(async () => {
  const transformedData = await getArticle(4694615)

  console.dir(transformedData)
})()
