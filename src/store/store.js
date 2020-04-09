const localforage = require("localforage");

export default class Store {
  constructor(namespace) {
    this.store = localforage.createInstance({
      name: namespace,
    });
  }

  async getValue(key) {
    return await this.store.getItem(key);
  }

  setValue(key, value) {
    this.store.setItem(key, value);
  }

  async getKeys() {
    return await this.store.keys();
  }

  async getKeyValuePair() {
    let finalArray = [];
    await this.store.iterate(function (value, key, iterationNumber) {
      let currentObject = {};
      currentObject[key] = value;
      finalArray.push(currentObject);
    });
    return finalArray;
  }
}
