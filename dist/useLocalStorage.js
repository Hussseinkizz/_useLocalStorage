const _useStorage = (options) => {
  const { storageType = "local", encrypt = true } = options || {};
  let storage = storageType === "session" ? sessionStorage : localStorage;
  let storageKey = "default-key";
  const timeBomb = (key, cacheTime) => {
    if (typeof window) {
      setTimeout(() => {
        set(key, "");
      }, cacheTime);
    }
  };
  const resetStorage = () => {
    if (typeof window) {
      storage.clear();
    }
  };
  const simpleEncrypt = (key, data) => {
    const keyLength = key.length;
    let encryptedData = "";
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ keyLength;
      encryptedData += String.fromCharCode(charCode);
    }
    return "#" + encryptedData;
  };
  const simpleDecrypt = (key, encryptedData) => {
    const keyLength = key.length;
    let decryptedData = "";
    for (let i = 0; i < encryptedData.length; i++) {
      const charCode = encryptedData.charCodeAt(i) ^ keyLength;
      decryptedData += String.fromCharCode(charCode);
    }
    return decryptedData;
  };
  let set = (key, stateToPersist) => {
    try {
      storage.setItem(key, JSON.stringify(stateToPersist));
    } catch (error) {
      throw new Error(`Error setting state ${key}: ${error}`);
    }
  };
  let get = (key) => {
    try {
      let state = JSON.parse(storage.getItem(key));
      if (state) {
        return state;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error(`Error retrieving state ${key}: ${error}`);
    }
  };
  const stateSetter = (stateKey, newState) => {
    if (encrypt) {
      let stateToPersist = simpleEncrypt(stateKey, JSON.stringify(newState));
      set(stateKey, stateToPersist);
    } else {
      set(stateKey, newState);
    }
  };
  const setState = (key, newState, options2 = {}) => {
    const { cacheTimeout = true, cacheTime = 60 * 1e3 } = options2;
    if (typeof window) {
      try {
        let stateKey = key ?? storageKey;
        const existingState = getState(stateKey);
        if (existingState) {
          let mergedState = { ...existingState, ...newState };
          stateSetter(stateKey, mergedState);
        } else {
          stateSetter(stateKey, newState);
        }
        if (cacheTimeout === true) {
          timeBomb(stateKey, cacheTime);
        }
        return getState(stateKey);
      } catch (error) {
        console.error(`Error Persisting State: ${error}`);
      }
    } else {
      return;
    }
  };
  const getState = (storageKey2) => {
    if (typeof window) {
      try {
        const probablyEncryptedState = get(storageKey2);
        if (probablyEncryptedState) {
          const isEncrypted = typeof probablyEncryptedState === "string" && probablyEncryptedState.startsWith("#");
          if (isEncrypted) {
            const decryptedState = simpleDecrypt(
              storageKey2,
              probablyEncryptedState.substring(1)
            );
            return JSON.parse(decryptedState);
          } else {
            return probablyEncryptedState;
          }
        }
      } catch (error) {
        console.error(`Error retrieving local state: ${error}`);
      }
    }
    return null;
  };
  const onChange = (callback) => {
    if (typeof window) {
      window.addEventListener("storage", (event) => {
        callback(event);
      });
    }
  };
  return { getState, setState, resetStorage, onChange };
};
export {
  _useStorage
};
