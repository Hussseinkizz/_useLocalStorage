!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).useLocalStorage={})}(this,(function(e){"use strict";e._useStorage=e=>{const{storageType:t="local",encrypt:r=!0}=e||{};let o="session"===t?sessionStorage:localStorage;let n=(e,t)=>{try{o.setItem(e,JSON.stringify(t))}catch(r){throw new Error(`Error setting state ${e}: ${r}`)}};const s=(e,t)=>{if(r){let r=((e,t)=>{const r=e.length;let o="";for(let n=0;n<t.length;n++){const e=t.charCodeAt(n)^r;o+=String.fromCharCode(e)}return"#"+o})(e,JSON.stringify(t));n(e,r)}else n(e,t)},i=e=>{try{const t=(e=>{try{return JSON.parse(o.getItem(e))||null}catch(t){throw new Error(`Error retrieving state ${e}: ${t}`)}})(e);if(t){if("string"==typeof t&&t.startsWith("#")){const r=((e,t)=>{const r=e.length;let o="";for(let n=0;n<t.length;n++){const e=t.charCodeAt(n)^r;o+=String.fromCharCode(e)}return o})(e,t.substring(1));return JSON.parse(r)}return t}}catch(t){}return null};return{getState:i,setState:(e,t,r={})=>{const{cacheTimeout:o=!0,cacheTime:a=6e4}=r;try{let r=e??"default-key";const c=i(r);if(c){let e={...c,...t};s(r,e)}else s(r,t);return!0===o&&((e,t)=>{setTimeout((()=>{n(e,"")}),t)})(r,a),i(r)}catch(c){}},resetStorage:()=>{o.clear()},onChange:e=>{window.addEventListener("storage",(t=>{e(t)}))}}},Object.defineProperty(e,Symbol.toStringTag,{value:"Module"})}));