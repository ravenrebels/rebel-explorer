/*
  Updating the database and reading from the database must be in the same
  process
*/

const debugMessage = [];
let isUpdating = false;
function addDebugMessage(str) {
  debugMessage.unshift(str);
  if (debugMessage.length > 50) {
    debugMessage.pop();
  }
}
addDebugMessage("Starting " + new Date().toLocaleTimeString());

export function getDebugMessage() {
  return debugMessage;
}
