import 'reflect-metadata';
import { assignWithoutNull } from './etc';
import { processEnv } from './processEnv';

const CONFIG_METADATA = Symbol('config');

interface ClassType<T> {
  new (...args: any): T;
  readonly prototype: T;
}

interface ConfigKeyMetadata<T> {
  kind: 'key' | 'child';
  key: string | symbol;
  keyParams?: ConfigKeyParams<T>;
  childType?: ClassType<T>;
}

interface ConfigKeyParams<T> {
  env?: string;
  validate?: (v: T) => boolean;
  required?: boolean;
  warnIfNotGiven?: boolean | string;
  default?: T | { [environment: string]: T };
}

export const ConfigKey =
  (params: ConfigKeyParams<any> = {}): PropertyDecorator =>
  (target: object, propertyKey: string | symbol) => {
    const metadata: ConfigKeyMetadata<any> = {
      kind: 'key',
      key: propertyKey,
      keyParams: params,
    };
    const existingMetadata = Reflect.getMetadata(CONFIG_METADATA, target) ?? [];
    Reflect.defineMetadata(CONFIG_METADATA, [...existingMetadata, metadata], target);
  };

export const ChildConfig =
  (typeFunction: () => ClassType<any>): PropertyDecorator =>
  (target: object, propertyKey: string | symbol) => {
    const metadata: ConfigKeyMetadata<any> = {
      kind: 'child',
      key: propertyKey,
      childType: typeFunction(),
    };
    const existingMetadata = Reflect.getMetadata(CONFIG_METADATA, target) ?? [];
    Reflect.defineMetadata(CONFIG_METADATA, [...existingMetadata, metadata], target);
  };

class ConfigValidationError extends Error {}

interface LoadConfigOptions {
  environment: string;

  /**
   * a hook called for every child configs.
   * you can register configs to your IoC libraries like TypeDI, inverisfy, etc...
   */
  iocHook: (configType: ClassType<any>, configObject: any) => void;

  /** overrides `process.env`. */
  processEnv: { [envKey: string]: string | undefined };
  path: string[];
}

const DEFAULT_CONFIG: LoadConfigOptions = {
  environment: 'default',
  iocHook: () => {},
  processEnv,
  path: [],
};

export function loadConfig<T extends object>(type: ClassType<T>, options: Partial<LoadConfigOptions> = {}): T {
  const { environment, processEnv, path, iocHook } = assignWithoutNull(DEFAULT_CONFIG, options) as LoadConfigOptions;

  const target = new type();
  const targetObject = target as Record<string | symbol, any>;
  const metadata = Reflect.getMetadata(CONFIG_METADATA, type.prototype) as ConfigKeyMetadata<any>[];

  for (const { kind, key, keyParams, childType } of metadata) {
    if (kind === 'child' && childType) {
      targetObject[key] = loadConfig(childType, { ...options, path: [...path, String(key)] });
      continue;
    }
    const type = Reflect.getMetadata('design:type', target, key);
    const { default: defaultValue, env, validate, required, warnIfNotGiven } = keyParams!;

    const prettyKey = `${[...path, key].join('.')}${env ? ` (${env})` : ''}`;

    if (defaultValue) {
      if (typeof defaultValue === 'object') {
        // in this case, the default value varies by environment
        const defaultValueOfEnvironment = defaultValue[environment] ?? defaultValue['default'];
        if (defaultValueOfEnvironment == null) {
          throw new ConfigValidationError(`${prettyKey} has no default value for either ${environment} or default.`);
        }
        targetObject[key] = defaultValueOfEnvironment;
      } else {
        targetObject[key] = defaultValue;
      }
    }
    if (env) {
      // load from env
      const envValue = processEnv[env];
      if (envValue) {
        targetObject[key] = type(envValue);

        // basic validation: string-numeric
        if (typeof targetObject[key] === 'number' && isNaN(targetObject[key])) {
          throw new ConfigValidationError(`${prettyKey} should be a numeric`);
        }
      } else if (warnIfNotGiven === environment || (typeof warnIfNotGiven === 'boolean' && warnIfNotGiven)) {
        console.log(
          'config',
          `${prettyKey} is required on ${environment} but not given. falling back to default value ${targetObject[key]}...`,
        );
      }
    }
    if (validate) {
      const isValid = validate(targetObject[key]);
      if (!isValid) {
        throw new ConfigValidationError(`invalid value: ${prettyKey}`);
      }
    }
    if (required && targetObject[key] == null) {
      throw new ConfigValidationError(`${prettyKey} is missing`);
    }
  }
  iocHook(type, target);
  return target;
}
