import { InMemDriver, InMemDriverConfig } from '~/persistence';
import { sleep } from '~/utils';

const TEST_ID = 'foo';
const DEFAULT_TTL = 1000;

describe('InMemDriver', () => {
  let inMemDriver: InMemDriver;

  beforeEach(async () => {
    const config = Object.assign(new InMemDriverConfig(), { maxObjects: 5, vacuumIntervalInMs: DEFAULT_TTL / 10 });
    inMemDriver = new InMemDriver(config);
    await inMemDriver.initialize();
  });

  describe('save()', () => {
    it('should persist with no error', async () => {
      const object = { id: TEST_ID, bar: true };
      await inMemDriver.save(object, DEFAULT_TTL);
      expect(await inMemDriver.find({ id: object.id })).toEqual(object);
    });

    it('should remove items after TTL expires', async () => {
      const ttl = DEFAULT_TTL / 20;
      await inMemDriver.save({ id: TEST_ID }, ttl);
      await sleep(ttl  * 2);
      expect(await inMemDriver.find({ id: TEST_ID })).toBeFalsy();
    });
  });

  describe('find()', () => {
    it('should return items with exact match', async () => {
      await inMemDriver.save({ id: TEST_ID, bar: true }, DEFAULT_TTL);
      expect(await inMemDriver.find({ bar: true })).toEqual({ id: TEST_ID, bar: true });
    });

    it('should return items with recursive match', async () => {
      await inMemDriver.save({ id: TEST_ID, nested: { bar: 'catch me' } }, DEFAULT_TTL);
      expect(await inMemDriver.find({ nested: { bar: 'catch me' } })).toEqual(expect.objectContaining({ id: TEST_ID }));
      expect(await inMemDriver.find({ nested: {} })).toEqual(expect.objectContaining({ id: TEST_ID }));
      expect(await inMemDriver.find({ nested: { bar: 'invalid'} })).toBeUndefined();
    });
  });
});
