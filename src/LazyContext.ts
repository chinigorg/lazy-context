const isFunction = (value: unknown): value is (...args: unknown[]) => unknown => {
  return value !== undefined && value !== null && typeof value === 'function'
}

type NoArgsFunction<V> = () => V

type MaybeThunk<V> = NoArgsFunction<V> | V | undefined

type State<T> = Partial<{
  [K in keyof T]: MaybeThunk<T[K]>
}>

export class LazyContext<T> {
  private readonly defaultState?: State<T>

  private currentState: State<T> = {}

  public constructor(defaultState?: State<T>) {
    this.defaultState = Object.freeze(defaultState)
    this.reset()
  }

  public get<K extends keyof T>(key: K): T[K] | undefined {
    const val: MaybeThunk<T[K]> = this.currentState[key]

    return isFunction(val) ? val() : val
  }

  public set<K extends keyof T>(key: K, val: MaybeThunk<T[K]>): void {
    this.currentState[key] = val
  }

  public reset(): void {
    this.currentState = { ...this.defaultState }
  }
}
