import { test } from 'mocha'
import { expect } from 'chai'
import { typesafeObject } from '../src'

const typesafe = typesafeObject({
  int: (v) => Math.round(Number(v)),
  answer: (v) => {
    if (v !== 42) throw new Error('wrong answer')
    return 42
  },
})

test('handles success', () => {
  const intParser = typesafe.objectParser({
    value: 'int',
  })

  const result = intParser.parse({ value: '1' })

  expect(result).to.eql({
    value: 1,
  })
})

test('throws if parsing fails', () => {
  const answerParser = typesafe.objectParser({
    guess: 'answer',
  })

  expect(() => {
    answerParser.parse({ guess: 1 })
  }).to.throw('Invalid input. guess: wrong answer (answer).')
})

test('throws when creating parser with unknown field', () => {
  expect(() => {
    typesafe.objectParser({
      something: 'bogus',
    } as any)
  }).to.throw(
    `Invalid schema: Unknown field type 'bogus' for key 'something'. Valid types are: 'answer', 'int'.`
  )
})

test('throws if passed a non-object', () => {
  const answerParser = typesafe.objectParser({
    guess: 'answer',
  })

  expect(() => {
    answerParser.parse(1)
  }).to.throw('Invalid input: expected object but got number.')
})

test('can extend with more fields', () => {
  const extended = typesafe.extend({
    foo: (x) => `foo:${x}`,
  })

  const parser = extended.objectParser({
    a: 'int',
    b: 'foo',
  })

  const result = parser.parse({
    a: 42,
    b: 'bar',
  })

  expect(result).to.eql({
    a: 42,
    b: 'foo:bar',
  })
})
