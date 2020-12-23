import { typesafeObject } from '../src'

//
// Errors that happen during parsing are caught and summarized
//
const errorExample = typesafeObject({
  positiveNumber: (value) => {
    if (typeof value !== 'number') throw new Error('not a number!')
    if (value <= 0) throw new Error('must be greater than zero')
    return value
  },
})

const ageParser = errorExample.objectParser({
  age: 'positiveNumber',
  weight: 'positiveNumber',
})

try {
  ageParser.parse({ age: 0, weight: '50' })
} catch (e) {
  console.log(e.message)
  // => Invalid input. age: must be greater than zero (positiveNumber), weight: not a number! (positiveNumber
}
