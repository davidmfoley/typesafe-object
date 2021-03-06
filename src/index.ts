type Converter = (x: any) => any

interface ObjectParser<Result> {
  parse: (input: any) => Result
}

interface Parser {
  parse: (input: any) => any
}

type Fields = Record<string, Converter>

type ObjectSchema<C extends Fields> = Readonly<
  Record<string, keyof C | Function | Parser>
>

type Result<C extends Fields, S extends ObjectSchema<C>> = {
  [K in keyof S]: S[K] extends string
    ? ReturnType<C[S[K]]>
    : S[K] extends Converter
    ? ReturnType<S[K]>
    : S[K] extends Parser
      ?  ReturnType<S[K]['parse']>
      : never
}

export const objectParser = <S extends Readonly<ObjectSchema<{}>>>(s: S) =>
  typesafeObject().objectParser(s)

const checkForUnknownFields = <
  F extends Fields,
  S extends Readonly<ObjectSchema<F>>
>(
  fieldTypes: F,
  schema: S
) => {
  const unknownFields = Object.keys(schema).filter(
    (f) => typeof schema[f] === 'string' && !fieldTypes[schema[f] as any]
  )

  if (unknownFields.length) {
    throw new Error(
      `Invalid schema: ${unknownFields
        .map((f) => `Unknown field type '${schema[f]}' for key '${f}'`)
        .join('. ')}. Valid types are: ${Object.keys(fieldTypes)
        .sort()
        .map((f) => `'${f}'`)
        .join(', ')}.`
    )
  }
}

const getConverters = <F extends Fields, S extends Readonly<ObjectSchema<F>>>(
  fieldTypes: F,
  schema: S
) =>
  Object.keys(schema).map((k) => ({
    fieldName: k,
    fieldType: schema[k],
    fn:
      typeof schema[k] === 'function'
        ? (schema[k] as Converter)
        : typeof schema[k] === 'string'
        ? (fieldTypes[schema[k] as keyof F] as Converter)
        : (schema[k] as any).parse as Converter
  }))

export const typesafeObject = <F extends Fields>(fieldTypes?: F) => ({
  extend: <AF extends Fields>(additionalFields: AF) =>
    typesafeObject(({ ...fieldTypes, ...additionalFields } as unknown) as F &
      AF),

  objectParser: <S extends Readonly<ObjectSchema<F>>>(
    schema: S
  ): ObjectParser<Result<F, S>> => {
    checkForUnknownFields(fieldTypes, schema)
    const converters = getConverters(fieldTypes, schema)

    return {
      parse: (input: any) => {
        let result: any = {}
        let errors: string[] = []
        if (typeof input !== 'object')
          throw new Error(
            `Invalid input: expected object but got ${typeof input}.`
          )

        for (let { fieldType, fieldName, fn } of converters) {
          try {
            const val = fn(input[fieldName])
            if (typeof val !== 'undefined') result[fieldName] = val
          } catch (e) {
            errors.push(`${fieldName}: ${e.message || e} (${fieldType})`)
          }
        }

        if (errors.length) {
          throw new Error(`Invalid input. ${errors.join(', ')}.`)
        }
        return result as Result<F, S>
      },
    }
  },
})
