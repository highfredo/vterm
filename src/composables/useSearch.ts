import uFuzzy from '@leeoniya/ufuzzy'
import { computed, ComputedRef, Ref } from 'vue'
import { filter as _filter, isArray } from 'lodash-es'

const uf = new uFuzzy({
  intraMode: 0,
  intraIns: 100
})

export type SearchResult<T> = {
  item: T,
  highlight: Partial<T>
}

const mark = (part: string, matched: boolean) => matched ? '<b>' + part + '</b>' : part;

const serialize = <T> (object: T, fields: string[]): string => {
  return fields.map(f => {
    const val = object[f]
    if(isArray(val)) {
      return val.join('\x01')
    } else {
      return val
    }
  }).join('\x00')
}

const deserialize = <T> (str: string, fields: string[]): Partial<T> => {
  const parts = str.split('\x00')
  return fields.reduce((acum: Partial<T>, current: string, idx: number) => {
    let val: any = parts[idx]
    if(!val) return acum

    if(val.includes('\x01')) {
      val = val.split('\x01')
    }

    acum[current] = val
    return acum
  }, {})
}

export const useSearch =  () => {
  return {
    search<T>(objects: Ref<T[]>, fields: string[], q: Ref<string>, filter?: ComputedRef<Partial<T>>): ComputedRef<SearchResult<T>[]> {
      return computed(() => {
        const needle = q.value
        const fObjects = filter ? _filter(objects.value, filter.value) : objects.value
        const haystack = fObjects.map( o => serialize(o, fields))
        const result: SearchResult<T>[] =  []

        const [idxs, info, order] =
          uf.search(haystack, needle, true, Infinity)

        if(!idxs || !info || !order) {
          return <SearchResult<T>[]> fObjects.map(o => {
            return {
              item: o,
              highlight: {}
            }
          })
        }

        for (let i = 0; i < order.length; i++) {
          const infoIdx = order[i];
          const html = uFuzzy.highlight(
            haystack[info.idx[infoIdx]],
            info.ranges[infoIdx],
            mark
          )
          const item = fObjects[info.idx[order[i]]]

          const highlight = deserialize(html, fields)

          result.push({
            item,
            highlight
          })
        }

        return result
      })
    }
  }
}
