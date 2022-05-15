import { LazyContext } from './LazyContext'

interface TestCtx {
  someString: string
  someNumber: number
  someAsyncString: Promise<string>
}

describe('Context', () => {
  describe('get/set', () => {
    describe('when no default values have been provided', () => {
      const ctx = new LazyContext<TestCtx>()

      afterEach(() => {
        ctx.reset()
      })

      it('defaults to undefined', () => {
        expect(ctx.get('someString')).toBeUndefined()
      })

      it('supports lazily-evaluated thunks (no-arg functions)', () => {
        ctx.set('someString', () => 'bar')
        expect(ctx.get('someString')).toEqual('bar')
      })

      it('supports eagerly-evaluated primitives', () => {
        ctx.set('someString', 'bar')
        expect(ctx.get('someString')).toEqual('bar')
      })

      it('supports async no-arg functions', async () => {
        ctx.set(
          'someAsyncString',
          async () =>
            new Promise(resolve => {
              resolve('late-arriving string')
            }),
        )

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(await ctx.get('someAsyncString')!).toEqual('late-arriving string')
      })

      it('does not support functions with arguments', () => {
        // @ts-expect-error - Deliberately providing a function with non-zero arity
        ctx.set('someString', (i: number) => `i was given: ${i}`)

        // But in practice simply invokes the function without args
        expect(ctx.get('someString')).toEqual('i was given: undefined')
      })

      it('allows unsetting a previously-set value', () => {
        ctx.set('someString', 'bar')
        ctx.set('someString', undefined)
        expect(ctx.get('someString')).toBeUndefined()
      })

      describe('when lazy values are overridden', () => {
        beforeEach(() => {
          ctx.set('someString', () => `foo level ${ctx.get('someNumber') ?? -1}`)
          ctx.set('someNumber', 1)
        })

        it('prefers the most recent value', () => {
          expect(ctx.get('someString')).toEqual('foo level 1')
          expect(ctx.get('someNumber')).toEqual(1)
        })

        describe('when overridden again in a deeper context', () => {
          beforeEach(() => {
            ctx.set('someNumber', 2)
          })

          it('prefers the most recent value', () => {
            expect(ctx.get('someString')).toEqual('foo level 2')
            expect(ctx.get('someNumber')).toEqual(2)
          })
        })
      })

      describe('when eager values are overridden', () => {
        beforeEach(() => {
          ctx.set('someNumber', 0)
          ctx.set('someString', `foo level ${ctx.get('someNumber') ?? -1}`)
          ctx.set('someNumber', 1) // Even this is too late
        })

        it('retains the value at the point the eager value was defined', () => {
          expect(ctx.get('someString')).toEqual('foo level 0')
        })

        describe('regardless of future overrides', () => {
          beforeEach(() => {
            ctx.set('someNumber', 2)
          })

          it('retains the value at the point the eager value was defined', () => {
            expect(ctx.get('someString')).toEqual('foo level 0')
          })
        })
      })
    })

    describe('when default values have been provided', () => {
      const ctx = new LazyContext<TestCtx>({
        someString: 'foo',
        someNumber: 0,
      })

      it('uses default values', () => {
        expect(ctx.get('someString')).toEqual('foo')
        expect(ctx.get('someNumber')).toEqual(0)
      })

      it('prefers explicitly-defined values', () => {
        ctx.set('someString', 'bar')
        expect(ctx.get('someString')).toEqual('bar')
      })
    })
  })

  describe('reset', () => {
    describe('when default values are provided', () => {
      const ctx = new LazyContext<TestCtx>({
        someString: 'foo',
      })

      describe('when no values have been overridden', () => {
        it('reset has no effect', () => {
          ctx.reset()
          expect(ctx.get('someString')).toEqual('foo')
        })
      })

      describe('when variables have been overridden', () => {
        it('resets to the default values', () => {
          ctx.set('someString', 'qux')
          ctx.reset()
          expect(ctx.get('someString')).toEqual('foo')
        })
      })
    })

    describe('when no default values are provided', () => {
      const ctx = new LazyContext<TestCtx>()

      it('reset has no effect', () => {
        ctx.reset()
        expect(ctx.get('someString')).toBeUndefined()
      })
    })
  })
})
