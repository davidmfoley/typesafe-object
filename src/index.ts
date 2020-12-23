type Fields = Record<string, (x: any) => any>

type ObjectSchema<C extends Fields> = Readonly<Record<string, keyof C>>

type Result<C extends Fields, S extends ObjectSchema<C>> = {
  [K in keyof S]: ReturnType<C[S[K]]>
}

export const typesafeObject = <F extends Fields>(fieldTypes: F) => ({
  extend: <AF extends Fields>(additionalFields: AF) =>
    typesafeObject(({ ...fieldTypes, ...additionalFields } as unknown) as F &
      AF),
  objectParser: <S extends Readonly<ObjectSchema<F>>>(schema: S) => {
    const unknownFields = Object.keys(schema).filter(
      (f) => !fieldTypes[schema[f]]
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
    const keys = Object.keys(schema)
    const converters = keys.map((k) => ({
      fieldName: k,
      fieldType: schema[k],
      fn: fieldTypes[schema[k]],
    }))

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
            result[fieldName] = fn(input[fieldName])
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
