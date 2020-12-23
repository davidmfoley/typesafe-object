import { typesafeObject } from '../src'

const typesafe = typesafeObject({
  anyValue: (value) => value,
  capitalizedString: (value) => ('' + value).toUpperCase(),
  roundedInteger: (value) => Math.round(Number(value)),
  positiveNumber: (value) => {
    if (typeof value !== 'number') throw new Error('not a number!')
    if (value <= 0) throw new Error('must be greater than zero')
    return value
  },
})

// Create an object parser from a schema
//
// A "Schema" is an object that has a key for each field, and the value is one of the field types you defined.
//
// The keys here match the fields on the objects you will parse.
// The values are the keys that we used above for the field definitions.
//
// This is typescript-enabled, so you will see type errors if any of the field types don't match the ones you set up in the first step.
//
const parser = typesafe.objectParser({
  firstName: 'capitalizedString',
  lastName: 'capitalizedString',
  age: 'roundedInteger',
})

// the field types are determined by the return types of the
// functions we used above.

const result = parser.parse({
  firstName: 'Arthur',
  lastName: 'Dent',
  age: '53.7',
})

console.log('result:', result)

// This type is inferred
const age: number = result.age
console.log(age)

// Uncommenting the following line will show a type error
// console.log(result.somethingElse)
