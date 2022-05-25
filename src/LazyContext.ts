const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => {
  return value !== undefined && value !== null && typeof value === 'function'
}

type NoArgsFunction<V> = () => V

type MaybeThunk<V> = NoArgsFunction<V> | V | undefined

type State<T> = Partial<{
  [K in keyof T]: MaybeThunk<T[K]>
}>

type ILazyContext<T> = T & {
  get: <K extends keyof T>(key: K) => T[K] | undefined
  set: <K extends keyof T>(key: K, val: MaybeThunk<T[K]>) => boolean
  reset: () => void
}

export const lazyContext = <T>(defaultState?: State<T>): ILazyContext<T> => {
  const _defaultState: State<T> = Object.freeze({ ...defaultState })
  let _currentState: State<T> = {}

  const context = {
    get: <K extends keyof T>(key: K): T[K] | undefined => {
      const val: MaybeThunk<T[K]> = _currentState[key]

      return isFunction(val) ? val() : val
    },
    set: <K extends keyof T>(key: K, val: MaybeThunk<T[K]>): boolean => {
      const isNew = !(key in _currentState)
      _currentState[key] = val
      return isNew
    },
    reset: (): void => {
      _currentState = { ..._defaultState }
    },
  }

  context.reset()

  return new Proxy<ILazyContext<T>>(context as ILazyContext<T>, {
    get(target: ILazyContext<T>, p: string | symbol): unknown {
      if (p === 'get') {
        return target.get
      }

      if (p === 'set') {
        return target.set
      }

      if (p === 'reset') {
        return target.reset
      }

      return target.get(p as unknown as keyof T)
    },
  })
}
