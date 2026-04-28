export async function toDiagram (data, opts = { direction: 'TD', showliterals: true, showtypes: true }) {

  const lines = [`graph ${opts.direction}`]
  for (const node of data['@graph']) {
    visitNode(node, lines, opts)
  }
  return lines.join('\n')
}

function visitNode (node, lines, opts) {
  const s = toBox(node, lines, opts)
  for (let p in node) {
    if (p === '@id') continue

    let values = node[p]
    if (!Array.isArray(values)) {
      values = [values]
    }

    if (p === '@type') {
      if (!opts.showtypes) continue

      for (const type of values) {
          lines.push(`${s}-->|rdf:type|${type}`)
      }
      continue
    }

    p = p.replace(/[^A-Za-z0-9:]/, '')
    for (const value of values) {
      const o = toBox(value, lines, opts)
      if (o) {
        lines.push(`${s}-->|${p}|${o}`)
        if (typeof value === 'object' && '@id' in value) {
          visitNode(value, lines, opts)
        }
      }
    }
  }
}

let blankCounter = 0

function toBox (node, lines, opts) {
  if (typeof node === 'object' && '@value' in node) {
    let dt = node['@type']
    let lang = node['@language']
    let dir = node['@direction']
    node = node['@value']
    let note = ''
    if (dt) {
      note = dt
    } else if (lang) {
      if (dir) {
        lang += `--${dir}`
      }
      note = lang
    }
    if (note) node += ` [${note}]`
  }

  if (typeof node !== 'object') {
    if (!opts.showliterals) return null
    const id = escape(node)
    return `${id}["${node}"]`
  }

  if (!Array.isArray(node) && !('@id' in node)) {
    node['@id'] = `_:b${++blankCounter}`
  }

  if ('@id' in node) {
    const id = node['@id'].replace(/--+/, '-')
    const label = id
    return `${id}(${label})`
  }
}
