
function cartographerLog(logMethod, ...data) {
  logMethod('[Cartographer]', ...data);
}

export function log(...data) {
  cartographerLog(console.info, ...data);
}

export function error(...data) {
  cartographerLog(console.error, ...data);
}