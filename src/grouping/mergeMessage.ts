import { cloneDeep } from 'lodash';
import { Message } from '~/message';

export function mergeMessage(existing: Message, msg: Message): Message {
  const merged = cloneDeep(existing);

  const mergedFieldNames = <string[]>[];
  for (const existingField of existing.fields) {
    const differentField = msg.fields.find((it) => it.name === existingField.name && it.value !== existingField.value);
    if (differentField) {
      const mergedField = merged.fields.find((it) => it.name === existingField.name)!;
      mergedField.value = [existingField.value, differentField.value].join(', ');
      if (existingField.displayValue || differentField.displayValue) {
        mergedField.displayValue = [
          existingField.displayValue ?? existingField.value,
          differentField.displayValue ?? differentField.value,
        ].join(', ');
      }

      mergedFieldNames.push(existingField.name);
    }
  }

  const notIntersectedFields = msg.fields.filter(
    (it) => !mergedFieldNames.includes(it.name) && !existing.fields.find((that) => that.name !== it.name),
  );
  merged.fields.push(...notIntersectedFields);

  return merged;
}
