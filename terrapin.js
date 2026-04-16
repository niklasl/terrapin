export async function toDiagram (data) {

  const lines = ['graph TD']
  for (const node of data['@graph']) {
    const s = toBox(node)
    for (let p in node) {
      if (p === '@id') continue

      let values = node[p]
      if (!Array.isArray(values)) {
        values = [values]
      }

      if (p === '@type') {
        for (const type of values) {
            lines.push(`${s}-->|rdf:type|${type}`)
        }
        continue
      }

      p = p.replace(/[^A-Za-z0-9:]/, '')
      for (const value of values) {
        const o = toBox(value)
        if (o) {
          lines.push(`${s}-->|${p}|${o}`)
        }
      }
    }
  }
  return lines.join('\n')
}

function toBox (node) {
  if (typeof node !== 'object') {
    const id = encodeURIComponent(node)
    return `${id}[${node}]`
  }
  if ('@id' in node) {
    const id = node['@id'].replace('_:', '')
    const label = id
    return `${id}(${label})`
  }
}
