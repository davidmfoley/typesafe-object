# typesafe-object

Simple composable typesafe object validation and data conversion, with no dependencies.

Validating and converting data that is out of your control can be an annoying repetitive chore.

This happens all the time when accepting POST bodies in http endpoints, events in serverless functions, when integrating with external APIs or queueing systems, or any other piece of code that accepts data from the outside world.

- No dependencies
- No codegen
- No hassle


## How to use

There are two steps:

1. define your field types
1. create an object parser for a schema

### Initialize with your field types

These are the functions that validate and parse incoming fields.

The key names in this object are important -- they will be used in the next step to specify how each field in an object is parsed.

```
import { typesafeObject } from 'typesafe-object'

const typesafe = typesafeObject({
  capitalizedString: value => ('' + value).toUpperCase(),
  roundedInteger: value => Math.round(Number(value)),
})
```

### Create an object parser from a schema

A "Schema" is an object that has a key for each field, and the value is one of the field types you defined.

The keys here match the fields on the objects you will parse.
The values are the keys that we used above for the field definitions.

This is typescript-enabled, so you will see type errors if any of the field types don't match the ones you set up in the first step.

```
const parser = typesafe.objectParser({
  firstName: 'capitalizedString',
  lastName: 'capitalizedString',
  age: 'roundedInteger'
})
```

### Now parse some data:

```
const arthur = parser.parse({
  firstName: 'Arthur',
  lastName: 'Dent',
  age: '53.7'
})

console.log(arthur.firstName) // => 'ARTHUR'
console.log(arthur.lastName) // => 'DENT'
console.log(arthur.age) // => 54


// the field types are determined by the return types of the
// functions we used above. Since the 'roundedInteger' field
// returns a number, arthur.age is a number
const age: number = arthur.age

// This will be a type error.
// There is no field named 'answer'
console.log(arthur.answer)

```


