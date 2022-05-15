import { Context } from './Context'

interface TestCtx {
  foo: string
  bar: number
}

describe('Context', () => {
  describe('get/set', () => {
    describe('when no default values have been provided', () => {
      const ctx = new Context<TestCtx>()

      afterEach(() => {
        ctx.reset()
      })

      it('defaults to undefined', () => {
        expect(ctx.get('foo')).toBeUndefined()
      })

      describe('when values are overridden', () => {
        beforeEach(() => {
          ctx.set('foo', () => `foo level ${ctx.get('bar') ?? -1}`)
          ctx.set('bar', () => 1)
        })

        it('prefers the most recent value', () => {
          expect(ctx.get('foo')).toEqual('foo level 1')
          expect(ctx.get('bar')).toEqual(1)
        })

        describe('when overridden again in a deeper context', () => {
          beforeEach(() => {
            ctx.set('bar', () => 2)
          })

          it('prefers the most recent value', () => {
            expect(ctx.get('foo')).toEqual('foo level 2')
            expect(ctx.get('bar')).toEqual(2)
          })
        })
      })
    })

    describe('when default values have been provided', () => {
      const ctx = new Context<TestCtx>({
        foo: (): string => 'foo',
        bar: (): number => 0,
      })

      it('uses default values', () => {
        expect(ctx.get('foo')).toEqual('foo')
        expect(ctx.get('bar')).toEqual(0)
      })
    })
  })

  describe('reset', () => {
    describe('when default values are provided', () => {
      const ctx = new Context<TestCtx>({
        foo: (): string => 'foo',
      })

      describe('when no values have been overridden', () => {
        it('reset has no effect', () => {
          ctx.reset()
          expect(ctx.get('foo')).toEqual('foo')
        })
      })

      describe('when variables have been overridden', () => {
        it('resets to the default values', () => {
          ctx.set('foo', () => 'qux')
          ctx.reset()
          expect(ctx.get('foo')).toEqual('foo')
        })
      })
    })

    describe('when no default values are provided', () => {
      const ctx = new Context<TestCtx>()

      it('reset has no effect', () => {
        ctx.reset()
        expect(ctx.get('foo')).toBeUndefined()
      })
    })
  })
})
